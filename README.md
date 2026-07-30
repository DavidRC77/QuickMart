# QuickMart - Sistema de Punto de Venta e Inventario para Micromercado

Sistema web profesional para el micromercado **QuickMart** construido con **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui** y **Supabase (PostgreSQL)** siguiendo una estricta **Arquitectura MVC (Modelo-Vista-Controlador)**.

---

## 🌟 Características Principales

### 1. Autenticación y Control de Roles (RBAC)
- **Pantalla de Login**: Inicio de sesión con correo y contraseña.
- **Roles**: `Administrador` (Acceso total a gestión e inventarios) y `Cajero` (Acceso exclusivo a `/pos`).
- **Botones Demo de Acceso Rápido**: Ingreso con un solo clic para pruebas inmediatas como Admin o Cajero.

### 2. Módulo de Punto de Venta / Caja (`/pos`)
- **Escáner de Cámara (`html5-qrcode`)**: Lectura de código de barras mediante la cámara del dispositivo.
- **Soporte para Lector USB Físico**: Event Listener optimizado para pistolas de código de barras USB.
- **Carrito Interactivo**: Conteo automático por duplicados, edición de cantidades, eliminación y cálculo en tiempo real.
- **Gestión de Clientes / NIT / CI**: Búsqueda por NIT con autocompletado de Razón Social, registro rápido express o modo "Sin Datos / Cliente Anónimo".
- **Pago y Comprobante**: Métodos de pago (Efectivo, QR, Tarjeta), cálculo instantáneo de vuelto en efectivo y modal de **Ticket de Venta** térmico imprimible.

### 3. Gestión de Inventario y Productos (`/admin/productos`)
- **CRUD de Productos**: Código de barras, nombre, precio de costo, precio de venta, stock actual, stock mínimo y categoría.
- **Alertas Visuales de Stock Bajo**: Badges en **ROJO destellante** cuando `stock_actual <= stock_minimo`.
- **Filtros y Búsqueda**: Búsqueda reactiva por nombre/código y filtro por categoría.

### 4. Gestión de Categorías (`/admin/categorias`)
- **CRUD de Categorías**: Creación y edición dinámica de familias de productos.

### 5. Gestión de Usuarios y Personal (`/admin/usuarios`)
- Alta de nuevos Cajeros o Administradores guardando datos personales y asignación de rol.

### 6. Disparador (Trigger) PostgreSQL en Supabase
- Trigger automatizado `trg_descontar_stock` ejecutado `BEFORE INSERT ON detalle_ventas`.
- Descuenta automáticamente las unidades del producto y cancela la transacción lanzando una excepción si el stock es insuficiente.

### 7. Cierre de Caja y Reportes Diarios (`/admin/reportes`)
- Resumen de ingresos del día, recuento de ventas y desglose por método de pago (Efectivo / QR / Tarjeta).

---

## 📐 Arquitectura MVC (Model-View-Controller)

```
QuickMart/
├── lib/
│   ├── models/            # MODELOS (Data Access Layer & Interfaces DTO)
│   │   ├── types.ts
│   │   ├── productModel.ts
│   │   ├── categoryModel.ts
│   │   ├── customerModel.ts
│   │   ├── userModel.ts
│   │   └── saleModel.ts
│   ├── controllers/       # CONTROLADORES (Lógica de Negocio)
│   │   ├── authController.ts
│   │   └── posController.ts
│   └── supabase/
│       ├── client.ts
│       └── mockStore.ts   # Persistencia reactiva local (Fallback sin Supabase)
├── hooks/                 # HOOKS DE CONTROLADOR PARA VISTAS
│   ├── useAuth.ts
│   ├── usePosController.ts
│   └── useProductsController.ts
├── components/            # VISTAS (Componentes Visuales de Interfaz)
│   ├── pos/               # Escáner, Carrito, Pagos y Tickets
│   ├── navbar.tsx
│   └── sidebar.tsx
├── app/                   # VISTAS (Rutas y Páginas de Next.js App Router)
│   ├── login/
│   ├── pos/
│   └── admin/
└── supabase/
    └── schema.sql         # Script SQL de Base de Datos y Trigger Postgres
```

---

## 🚀 Instrucciones de Instalación y Ejecución

### 1. Clonar e Instalar Dependencias
```bash
npm install
```

### 2. Configurar Supabase (Opcional)
Si deseas conectar a un proyecto Supabase real, crea un archivo `.env.local` en la raíz con:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```
Ejecuta el script SQL ubicado en `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase.

*Nota: Si no configuras las variables de entorno, QuickMart funcionará de forma totalmente interactiva utilizando el almacén reactivo local con los datos semilla.*

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔐 Credenciales de Prueba (Demo)

- **Administrador**:
  - Email: `admin@quickmart.com`
  - Password: `admin123`
- **Cajero**:
  - Email: `cajero@quickmart.com`
  - Password: `cajero123`
