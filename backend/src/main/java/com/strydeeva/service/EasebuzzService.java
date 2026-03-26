package com.strydeeva.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class EasebuzzService {

    private static final Logger log = LoggerFactory.getLogger(EasebuzzService.class);

    private final String env;
    private final String key;
    private final String salt;

    public EasebuzzService(
            @Value("${easebuzz.env:prod}") String env,
            @Value("${easebuzz.key}") String key,
            @Value("${easebuzz.salt}") String salt) {
        this.env = env == null ? "prod" : env.trim().toLowerCase();
        this.key = key == null ? "" : key.trim();
        this.salt = salt == null ? "" : salt.trim();
    }

    /**
     * Log effective config at startup (no secret values). Use server logs to confirm
     * prod vs test URL and that key/salt are not empty/overridden wrongly.
     */
    @PostConstruct
    public void logEasebuzzBootstrap() {
        log.info("Easebuzz init: paymentUrl={} envSetting={} keyLength={} saltLength={}",
                getPaymentUrl(), env, key.length(), salt.length());
        if (key.isEmpty() || salt.isEmpty()) {
            log.warn("Easebuzz key or salt is empty — check application.properties, profiles, and env vars (EASEBUZZ_KEY / EASEBUZZ_SALT).");
        }
    }

    public String getPaymentUrl() {
        if ("prod".equals(env) || "production".equals(env) || "live".equals(env)) {
            return "https://pay.easebuzz.in/payment/initiateLink";
        }
        return "https://testpay.easebuzz.in/payment/initiateLink";
    }

    public Map<String, String> buildInitiateFields(
            String txnid,
            String amount,
            String firstname,
            String email,
            String phone,
            String productinfo,
            String surl,
            String furl,
            String udf1,
            String udf2,
            String udf3,
            String udf4,
            String udf5) {
        Map<String, String> f = new LinkedHashMap<>();
        f.put("key", key);
        f.put("txnid", txnid);
        f.put("amount", amount);
        f.put("productinfo", productinfo);
        f.put("firstname", firstname);
        f.put("email", email);
        f.put("phone", phone);
        f.put("surl", surl);
        f.put("furl", furl);
        f.put("udf1", nullToEmpty(udf1));
        f.put("udf2", nullToEmpty(udf2));
        f.put("udf3", nullToEmpty(udf3));
        f.put("udf4", nullToEmpty(udf4));
        f.put("udf5", nullToEmpty(udf5));
        // udf6..udf10 MUST be present as empty for correct hash sequence
        f.put("udf6", "");
        f.put("udf7", "");
        f.put("udf8", "");
        f.put("udf9", "");
        f.put("udf10", "");
        f.put("hash", generateRequestHash(txnid, amount, productinfo, firstname, email,
                f.get("udf1"), f.get("udf2"), f.get("udf3"), f.get("udf4"), f.get("udf5")));
        return f;
    }

    public boolean verifyResponseHash(Map<String, String> responseFields) {
        String status = nullToEmpty(responseFields.get("status"));
        String txnid = nullToEmpty(responseFields.get("txnid"));
        String amount = nullToEmpty(responseFields.get("amount"));
        String productinfo = nullToEmpty(responseFields.get("productinfo"));
        String firstname = nullToEmpty(responseFields.get("firstname"));
        String email = nullToEmpty(responseFields.get("email"));
        String udf1 = nullToEmpty(responseFields.get("udf1"));
        String udf2 = nullToEmpty(responseFields.get("udf2"));
        String udf3 = nullToEmpty(responseFields.get("udf3"));
        String udf4 = nullToEmpty(responseFields.get("udf4"));
        String udf5 = nullToEmpty(responseFields.get("udf5"));
        String postedHash = nullToEmpty(responseFields.get("hash"));

        // Reverse hash:
        // salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
        String data = salt + "|" + status
                + "||||||"
                + udf5 + "|" + udf4 + "|" + udf3 + "|" + udf2 + "|" + udf1 + "|"
                + email + "|" + firstname + "|" + productinfo + "|" + amount + "|" + txnid + "|" + key;

        String expected = sha512(data);
        return !postedHash.isBlank() && postedHash.equalsIgnoreCase(expected);
    }

    private String generateRequestHash(String txnid, String amount, String productinfo, String firstname, String email,
            String udf1, String udf2, String udf3, String udf4, String udf5) {
        // Request hash:
        // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
        String data = key + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|"
                + nullToEmpty(udf1) + "|" + nullToEmpty(udf2) + "|" + nullToEmpty(udf3) + "|" + nullToEmpty(udf4) + "|"
                + nullToEmpty(udf5)
                + "||||||" + salt;
        return sha512(data);
    }

    private String sha512(String data) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] dig = md.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(dig.length * 2);
            for (byte b : dig)
                sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute SHA-512", e);
        }
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s.trim();
    }
}
