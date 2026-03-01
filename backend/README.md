# Strydeeva Admin Backend (Spring Boot)

## Requirements

- Java 17+
- Maven
- MySQL (e.g. local server on port 3306)

## Setup

1. Create a MySQL database (or let the app create it via `createDatabaseIfNotExist=true`):
   ```sql
   CREATE DATABASE IF NOT EXISTS strydeeva;
   ```

2. Update `src/main/resources/application.properties` if needed:
   - `spring.datasource.url` – JDBC URL
   - `spring.datasource.username` / `spring.datasource.password` – your MySQL credentials

3. **Use one JDK (Java 17+)** for both running and compiling.  
   If `java -version` shows 1.8 but `javac -version` shows 23, your PATH/JAVA_HOME is mixed: **Maven uses the `java` from JAVA_HOME**, so it can end up using Java 8 and fail.  
   Set `JAVA_HOME` to your **JDK 17 or JDK 23** install so that `java`, `javac`, and Maven all use the same JDK.  
   In PowerShell (current session):
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
   ```
   (Use your actual path, e.g. `jdk-17` if that’s what you have.)  
   Then check:
   ```powershell
   & "$env:JAVA_HOME\bin\java.exe" -version
   & "$env:JAVA_HOME\bin\javac.exe" -version
   ```
   Both should report 17 or 21/23. To set JAVA_HOME permanently: **Windows → System → About → Advanced system settings → Environment Variables** → add or set **JAVA_HOME** to the JDK folder (and ensure that folder’s `bin` is not required on PATH if you use JAVA_HOME).

4. Run the application (from the **backend** folder):

   **Option A – PowerShell (use `.\` before the script):**
   ```powershell
   cd c:\Users\HP\Desktop\Stryde\backend
   .\run-with-jdk.bat spring-boot:run
   ```

   **Option B – Or set JAVA_HOME in PowerShell, then Maven:**
   ```powershell
   cd c:\Users\HP\Desktop\Stryde\backend
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
   $env:Path = "$env:JAVA_HOME\bin;" + $env:Path
   mvn spring-boot:run
   ```

5. Default admin login (created on first run):
   - **Username:** `admin`
   - **Password:** `admin123`

## API (base: `http://localhost:8080/api`)

- **POST** `/admin/login` – body: `{ "username", "password" }` → returns `{ "token", "success" }`. Use header `Authorization: Bearer <token>` for all admin endpoints below.

- **POST** `/admin/products` – create product (multipart: name, basicPrice, category, description, sizeInventories JSON, images up to 3).
- **GET** `/admin/products` – list all products.
- **GET** `/admin/products/{id}` – get one product.
- **GET** `/admin/products/{id}/image/{index}` – get product image (BLOB).
- **PUT** `/admin/products/{id}` – update product.
- **DELETE** `/admin/products/{id}` – delete product.

- **GET** `/admin/orders?status=CONFIRMED` – list confirmed orders.
- **GET** `/admin/orders/export/excel` – download confirmed orders as Excel (.xlsx).

## Frontend

From the project root, run the Vite dev server. It proxies `/api` to `http://localhost:8080`, so the admin panel at `/adminlogin/101` can call the backend.

```bash
npm run dev
```

Then open: `http://localhost:5173/adminlogin/101` and log in with the default admin credentials.
