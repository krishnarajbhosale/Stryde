package com.strydeeva.service;

import com.strydeeva.entity.Order;
import com.strydeeva.entity.OrderItem;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class InvoicePdfService {

    // Company details
    private static final String BRAND_NAME = "STRYDEEVA";
    private static final String LEGAL_NAME = "House of AS";
    private static final String ADDRESS = "S No. 56, Plot No. 30, Kharadi Road, Lane No. 8, Aple Ghar Society, "
            + "Pune Municipal Corporation, Pune City, Pune 411014";
    private static final String GSTIN = "27AASFH7402F1Z9";

    public byte[] generate(Order order) {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            PDRectangle mediaBox = page.getMediaBox();
            float pageW = mediaBox.getWidth();
            float pageH = mediaBox.getHeight();
            float margin = 32f;

            // Colors (similar to screenshot)
            float[] blue = rgb(0x2B, 0x74, 0xB8);
            float[] lightGray = rgb(0xEE, 0xEE, 0xEE);
            float[] borderGray = rgb(0xCC, 0xCC, 0xCC);

            String invoiceId = "INV-" + (order.getCreatedAt() != null ? DateTimeFormatter.ofPattern("ddMMyyyy").withZone(ZoneId.systemDefault()).format(order.getCreatedAt()) : "NA")
                    + "-" + (order.getId() != null ? String.format("%06d", order.getId()) : "000000");

            String invoiceDate = order.getCreatedAt() != null ? DateTimeFormatter.ofPattern("dd-MMM-yyyy").withZone(ZoneId.systemDefault()).format(order.getCreatedAt()) : "";

            // Totals
            BigDecimal itemsTotal = calcItemsTotal(order.getItems());
            BigDecimal promoDisc = nvl(order.getPromoDiscount());
            BigDecimal shipping = nvl(order.getShippingFee());
            BigDecimal cod = nvl(order.getCodCharge());
            BigDecimal gst = nvl(order.getGstAmount());
            BigDecimal grandTotal = nvl(order.getTotalAmount());

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                // Title
                drawCenteredText(cs, PDType1Font.HELVETICA_BOLD, 28, pageW / 2, pageH - margin, "INVOICE");
                // top divider
                drawLine(cs, margin, pageH - margin - 18, pageW - margin, pageH - margin - 18, borderGray, 1);

                float topY = pageH - margin - 40;
                float boxH = 110;
                float gap = 12;
                float boxW = (pageW - 2 * margin - gap) / 2f;

                // Left box: invoice meta
                drawRect(cs, margin, topY - boxH, boxW, boxH, borderGray, 1, null);
                float lx = margin + 10;
                float ly = topY - 16;
                ly = drawKeyVal(cs, lx, ly, "Invoice ID:", invoiceId, blue);
                ly = drawKeyVal(cs, lx, ly, "Invoice Name:", "INVOICE", blue);
                ly = drawKeyVal(cs, lx, ly, "Invoice Date:", invoiceDate, blue);

                // Right box: supplier
                float rx0 = margin + boxW + gap;
                drawRect(cs, rx0, topY - boxH, boxW, boxH, borderGray, 1, null);
                float rx = rx0 + 10;
                float ry = topY - 16;
                ry = drawKeyVal(cs, rx, ry, "Supplier Name:", BRAND_NAME, blue);
                ry = drawKeyVal(cs, rx, ry, "Legal Name:", LEGAL_NAME, blue);
                // Keep GSTIN aligned inside the supplier box by limiting the address lines
                ry = drawWrappedKeyValLimited(cs, rx, ry, "Supplier Address:", ADDRESS, boxW - 20, blue, 3);
                float gstY = (topY - boxH) + 14;
                drawKeyVal(cs, rx, gstY, "GSTIN:", GSTIN, blue);

                // Customer / Bill to / Ship to box (full width)
                float custTop = topY - boxH - 18;
                float custH = 74;
                drawRect(cs, margin, custTop - custH, pageW - 2 * margin, custH, borderGray, 1, null);
                float cx = margin + 10;
                float cy = custTop - 16;
                cy = drawKeyVal(cs, cx, cy, "Customer Name:", safe(order.getCustomerName()), blue);

                // Bill to / Ship to split
                float splitYTop = custTop - 34;
                float splitH = 40;
                float fullW = pageW - 2 * margin;
                float halfW = fullW / 2f;
                drawRect(cs, margin, splitYTop - splitH, halfW, splitH, borderGray, 1, lightGray);
                drawRect(cs, margin + halfW, splitYTop - splitH, halfW, splitH, borderGray, 1, lightGray);

                drawText(cs, PDType1Font.HELVETICA_BOLD, 10, margin + 10, splitYTop - 14, "Bill To:", blue);
                drawText(cs, PDType1Font.HELVETICA_BOLD, 10, margin + halfW + 10, splitYTop - 14, "Ship To:", blue);

                String addr = safe(order.getShippingAddress()) + ", " + safe(order.getCity()) + " - " + safe(order.getPinCode());
                drawWrappedText(cs, PDType1Font.HELVETICA, 9, margin + 10, splitYTop - 26, halfW - 20, addr, rgb(0,0,0));
                drawWrappedText(cs, PDType1Font.HELVETICA, 9, margin + halfW + 10, splitYTop - 26, halfW - 20, addr, rgb(0,0,0));

                // ITEM DETAILS title
                float itemsTitleY = splitYTop - splitH - 24;
                drawText(cs, PDType1Font.HELVETICA_BOLD, 14, margin, itemsTitleY, "ITEM DETAILS", blue);

                // Items table
                float tableTop = itemsTitleY - 16;
                float rowH = 18;
                float tableW = pageW - 2 * margin;
                float[] colW = new float[] { 26, tableW * 0.42f, tableW * 0.14f, tableW * 0.08f, tableW * 0.18f, tableW * 0.18f };
                // Normalize col widths to tableW
                float sum = 0;
                for (float w : colW) sum += w;
                float scale = tableW / sum;
                for (int i = 0; i < colW.length; i++) colW[i] *= scale;

                // Header row (blue)
                float headerY = tableTop - rowH;
                drawRect(cs, margin, headerY, tableW, rowH, null, 0, blue);
                float x = margin;
                String[] headers = new String[] { "#", "Item Description", "Rate", "Qty", "Amount (INR)", "Remarks" };
                for (int i = 0; i < headers.length; i++) {
                    drawText(cs, PDType1Font.HELVETICA_BOLD, 9, x + 6, headerY + 5, headers[i], rgb(255,255,255));
                    x += colW[i];
                }

                // Rows
                List<OrderItem> items = order.getItems() != null ? order.getItems() : List.of();
                float yRow = headerY;
                int index = 1;
                for (OrderItem it : items) {
                    yRow -= rowH;
                    // row border
                    drawRect(cs, margin, yRow, tableW, rowH, borderGray, 1, null);
                    // vertical lines
                    float vx = margin;
                    for (int c = 0; c < colW.length; c++) {
                        drawLine(cs, vx, yRow, vx, yRow + rowH, borderGray, 1);
                        vx += colW[c];
                    }
                    drawLine(cs, margin + tableW, yRow, margin + tableW, yRow + rowH, borderGray, 1);

                    BigDecimal rate = it.getUnitPrice() != null ? it.getUnitPrice() : BigDecimal.ZERO;
                    int qty = Math.max(1, it.getQuantity());
                    BigDecimal amount = rate.multiply(new BigDecimal(qty)).setScale(2, RoundingMode.HALF_UP);

                    float cx0 = margin;
                    drawText(cs, PDType1Font.HELVETICA, 9, cx0 + 8, yRow + 5, String.valueOf(index), rgb(0,0,0)); cx0 += colW[0];
                    drawText(cs, PDType1Font.HELVETICA, 9, cx0 + 6, yRow + 5, trimTo(safe(it.getProductName()), 38), rgb(0,0,0)); cx0 += colW[1];
                    drawText(cs, PDType1Font.HELVETICA, 9, cx0 + 6, yRow + 5, rate.toPlainString(), rgb(0,0,0)); cx0 += colW[2];
                    drawText(cs, PDType1Font.HELVETICA, 9, cx0 + 8, yRow + 5, String.valueOf(qty), rgb(0,0,0)); cx0 += colW[3];
                    drawText(cs, PDType1Font.HELVETICA, 9, cx0 + 6, yRow + 5, amount.toPlainString(), rgb(0,0,0)); cx0 += colW[4];
                    drawText(cs, PDType1Font.HELVETICA, 9, cx0 + 6, yRow + 5, trimTo(safe(it.getSizeName()), 14), rgb(0,0,0));
                    index++;
                    if (yRow < 220) break; // keep 1 page simple
                }

                // SUMMARY block (right aligned) similar to screenshot
                float summaryTop = yRow - 18;
                drawText(cs, PDType1Font.HELVETICA_BOLD, 12, pageW / 2 - 30, summaryTop, "SUMMARY", blue);

                float sumBoxW = 260;
                float sumBoxX = pageW - margin - sumBoxW;
                float sumY = summaryTop - 12;
                float sumRowH = 16;

                List<String[]> sumRows = new ArrayList<>();
                sumRows.add(new String[] { "Subtotal", fmtMoney(itemsTotal) });
                if (promoDisc.compareTo(BigDecimal.ZERO) > 0) sumRows.add(new String[] { "Discount", "- " + fmtMoney(promoDisc) });
                sumRows.add(new String[] { "GST (12%)", fmtMoney(gst) });
                if (shipping.compareTo(BigDecimal.ZERO) > 0) sumRows.add(new String[] { "Shipping", fmtMoney(shipping) });
                if (cod.compareTo(BigDecimal.ZERO) > 0) sumRows.add(new String[] { "COD Charges", fmtMoney(cod) });

                // draw rows
                for (String[] r : sumRows) {
                    drawText(cs, PDType1Font.HELVETICA, 10, sumBoxX, sumY, r[0], rgb(0,0,0));
                    drawRightText(cs, PDType1Font.HELVETICA, 10, sumBoxX + sumBoxW, sumY, r[1], rgb(0,0,0));
                    sumY -= sumRowH;
                }

                // Grand total bar
                float grandY = sumY - 4;
                drawRect(cs, sumBoxX, grandY - 18, sumBoxW, 18, null, 0, blue);
                drawText(cs, PDType1Font.HELVETICA_BOLD, 10, sumBoxX + 8, grandY - 12, "Grand Total", rgb(255,255,255));
                drawRightText(cs, PDType1Font.HELVETICA_BOLD, 10, sumBoxX + sumBoxW - 8, grandY - 12, fmtMoney(grandTotal), rgb(255,255,255));
            }

            doc.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice", e);
        }
    }

    private void drawText(PDPageContentStream cs, PDType1Font font, int size, float x, float y, String text, float[] rgb) throws Exception {
        cs.beginText();
        cs.setFont(font, size);
        cs.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
        cs.newLineAtOffset(x, y);
        cs.showText(text != null ? text : "");
        cs.endText();
    }

    private void drawRightText(PDPageContentStream cs, PDType1Font font, int size, float rightX, float y, String text, float[] rgb) throws Exception {
        float w = font.getStringWidth(text) / 1000f * size;
        drawText(cs, font, size, rightX - w, y, text, rgb);
    }

    private void drawCenteredText(PDPageContentStream cs, PDType1Font font, int size, float cx, float y, String text) throws Exception {
        float w = font.getStringWidth(text) / 1000f * size;
        drawText(cs, font, size, cx - (w / 2f), y, text, rgb(0,0,0));
    }

    private void drawLine(PDPageContentStream cs, float x1, float y1, float x2, float y2, float[] rgb, float width) throws Exception {
        cs.setStrokingColor(rgb[0], rgb[1], rgb[2]);
        cs.setLineWidth(width);
        cs.moveTo(x1, y1);
        cs.lineTo(x2, y2);
        cs.stroke();
    }

    private void drawRect(PDPageContentStream cs, float x, float y, float w, float h, float[] strokeRgb, float strokeW, float[] fillRgb) throws Exception {
        if (fillRgb != null) {
            cs.setNonStrokingColor(fillRgb[0], fillRgb[1], fillRgb[2]);
            cs.addRect(x, y, w, h);
            cs.fill();
        }
        if (strokeRgb != null && strokeW > 0) {
            cs.setStrokingColor(strokeRgb[0], strokeRgb[1], strokeRgb[2]);
            cs.setLineWidth(strokeW);
            cs.addRect(x, y, w, h);
            cs.stroke();
        }
    }

    private float drawKeyVal(PDPageContentStream cs, float x, float y, String key, String val, float[] keyColor) throws Exception {
        drawText(cs, PDType1Font.HELVETICA, 10, x, y, key + " ", rgb(0,0,0));
        float keyW = PDType1Font.HELVETICA.getStringWidth(key + " ") / 1000f * 10;
        drawText(cs, PDType1Font.HELVETICA_BOLD, 10, x + keyW, y, safe(val), keyColor);
        return y - 14;
    }

    private float drawWrappedKeyVal(PDPageContentStream cs, float x, float y, String key, String val, float maxWidth, float[] keyColor) throws Exception {
        drawText(cs, PDType1Font.HELVETICA, 10, x, y, key + " ", rgb(0,0,0));
        float keyW = PDType1Font.HELVETICA.getStringWidth(key + " ") / 1000f * 10;
        return drawWrappedText(cs, PDType1Font.HELVETICA_BOLD, 10, x + keyW, y, maxWidth - keyW, safe(val), keyColor) - 2;
    }

    private float drawWrappedKeyValLimited(PDPageContentStream cs, float x, float y, String key, String val, float maxWidth, float[] keyColor, int maxLines) throws Exception {
        drawText(cs, PDType1Font.HELVETICA, 10, x, y, key + " ", rgb(0,0,0));
        float keyW = PDType1Font.HELVETICA.getStringWidth(key + " ") / 1000f * 10;
        return drawWrappedTextLimited(cs, PDType1Font.HELVETICA_BOLD, 10, x + keyW, y, maxWidth - keyW, safe(val), keyColor, maxLines) - 2;
    }

    private float drawWrappedText(PDPageContentStream cs, PDType1Font font, int size, float x, float y, float maxW, String text, float[] color) throws Exception {
        List<String> lines = wrap(font, size, maxW, text);
        float yy = y;
        for (String l : lines) {
            drawText(cs, font, size, x, yy, l, color);
            yy -= (size + 3);
        }
        return yy;
    }

    private float drawWrappedTextLimited(PDPageContentStream cs, PDType1Font font, int size, float x, float y, float maxW, String text, float[] color, int maxLines) throws Exception {
        List<String> lines = wrap(font, size, maxW, text);
        if (maxLines > 0 && lines.size() > maxLines) {
            List<String> cut = new ArrayList<>(lines.subList(0, maxLines));
            String last = cut.get(cut.size() - 1);
            cut.set(cut.size() - 1, trimTo(last, Math.max(6, last.length() - 1)));
            lines = cut;
        }
        float yy = y;
        for (String l : lines) {
            drawText(cs, font, size, x, yy, l, color);
            yy -= (size + 3);
        }
        return yy;
    }

    private List<String> wrap(PDType1Font font, int size, float maxW, String text) throws Exception {
        String t = safe(text);
        if (t.isBlank()) return List.of("");
        String[] words = t.split("\\s+");
        List<String> lines = new ArrayList<>();
        StringBuilder line = new StringBuilder();
        for (String w : words) {
            String candidate = line.length() == 0 ? w : line + " " + w;
            float width = font.getStringWidth(candidate) / 1000f * size;
            if (width <= maxW) {
                line.setLength(0);
                line.append(candidate);
            } else {
                if (line.length() > 0) lines.add(line.toString());
                line.setLength(0);
                line.append(w);
            }
        }
        if (line.length() > 0) lines.add(line.toString());
        return lines;
    }

    private String safe(String s) {
        return s == null ? "" : s.replaceAll("[\\r\\n\\t]+", " ").trim();
    }

    private BigDecimal nvl(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private BigDecimal calcItemsTotal(List<OrderItem> items) {
        BigDecimal total = BigDecimal.ZERO;
        if (items == null) return total;
        for (OrderItem it : items) {
            BigDecimal rate = it.getUnitPrice() != null ? it.getUnitPrice() : BigDecimal.ZERO;
            int qty = Math.max(1, it.getQuantity());
            total = total.add(rate.multiply(new BigDecimal(qty)));
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    private String fmtMoney(BigDecimal v) {
        return "Rs. " + nvl(v).setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private String trimTo(String s, int max) {
        String t = safe(s);
        if (t.length() <= max) return t;
        return t.substring(0, Math.max(0, max - 1)) + "…";
    }

    private float[] rgb(int r, int g, int b) {
        return new float[] { r / 255f, g / 255f, b / 255f };
    }
}

