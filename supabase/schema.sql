-- ============================================================================
-- SCRIPT DE BASE DE DATOS POSTGRESQL / SUPABASE PARA QUICKMART
-- Proyecto Supabase: https://wyubpnnscrlllkeaymtx.supabase.co
-- ============================================================================

-- 1. TIPOS ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('administrador', 'cajero');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE metodo_pago_enum AS ENUM ('efectivo', 'qr', 'tarjeta');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA CATEGORIAS
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_barras VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    precio_costo NUMERIC(12, 2) NOT NULL CHECK (precio_costo >= 0),
    precio_venta NUMERIC(12, 2) NOT NULL CHECK (precio_venta >= 0),
    stock_actual INT NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INT NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA USUARIOS / PERSONAL
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    ci VARCHAR(50) NOT NULL UNIQUE,
    telefono VARCHAR(50),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol user_role NOT NULL DEFAULT 'cajero',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nit_ci VARCHAR(50) NOT NULL UNIQUE,
    razon_social VARCHAR(200) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA VENTAS
CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_factura VARCHAR(50) NOT NULL UNIQUE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    nit_ci VARCHAR(50) NOT NULL,
    razon_social VARCHAR(200) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    metodo_pago metodo_pago_enum NOT NULL,
    monto_recibido NUMERIC(12, 2) NOT NULL CHECK (monto_recibido >= 0),
    cambio NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cambio >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA DETALLE_VENTAS
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. ÍNDICES DE RENDIMIENTO PARA BÚSQUEDAS RÁPIDAS Y ESCÁNER
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_productos_codigo_barras ON productos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_clientes_nit_ci ON clientes(nit_ci);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_venta_id ON detalle_ventas(venta_id);

-- ============================================================================
-- 9. TRIGGER POSTGRESQL: DESCUENTO AUTOMÁTICO Y VALIDACIÓN ESTRICTA DE STOCK
-- ============================================================================

CREATE OR REPLACE FUNCTION descontar_stock_y_validar()
RETURNS TRIGGER AS $$
DECLARE
    v_stock_actual INT;
    v_nombre_producto VARCHAR(200);
BEGIN
    -- Obtener el stock actual y nombre con bloqueo exclusivo de fila (FOR UPDATE)
    SELECT stock_actual, nombre 
    INTO v_stock_actual, v_nombre_producto
    FROM productos
    WHERE id = NEW.producto_id
    FOR UPDATE;

    -- Validar si existe el producto
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto solicitado (ID %) no existe en inventario.', NEW.producto_id;
    END IF;

    -- Validar stock suficiente antes de procesar
    IF v_stock_actual < NEW.cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente para "%". Disponible: % u., Solicitado: % u.', 
            v_nombre_producto, v_stock_actual, NEW.cantidad;
    END IF;

    -- Descontar unidades automáticamente
    UPDATE productos
    SET stock_actual = stock_actual - NEW.cantidad
    WHERE id = NEW.producto_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el Trigger que se ejecuta ANTES de registrar cada detalle de venta
DROP TRIGGER IF EXISTS trg_descontar_stock ON detalle_ventas;
CREATE TRIGGER trg_descontar_stock
BEFORE INSERT ON detalle_ventas
FOR EACH ROW
EXECUTE FUNCTION descontar_stock_y_validar();

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) Y POLÍTICAS DE ACCESO PARA LA APLICACIÓN
-- ============================================================================

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_ventas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo en categorias" ON categorias;
CREATE POLICY "Permitir todo en categorias" ON categorias FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en productos" ON productos;
CREATE POLICY "Permitir todo en productos" ON productos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en usuarios" ON usuarios;
CREATE POLICY "Permitir todo en usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en clientes" ON clientes;
CREATE POLICY "Permitir todo en clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en ventas" ON ventas;
CREATE POLICY "Permitir todo en ventas" ON ventas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en detalle_ventas" ON detalle_ventas;
CREATE POLICY "Permitir todo en detalle_ventas" ON detalle_ventas FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 11. DATOS DE PRUEBA (SEED DATA)
-- ============================================================================

-- Categorías iniciales
INSERT INTO categorias (id, nombre, descripcion) VALUES
('11111111-1111-1111-1111-111111111111', 'Bebidas', 'Gaseosas, jugos, aguas y bebidas energéticas'),
('22222222-2222-2222-2222-222222222222', 'Lácteos', 'Leche, quesos, yogures y derivados'),
('33333333-3333-3333-3333-333333333333', 'Abarrotes', 'Arroz, fideos, aceites, enlatados y granos'),
('44444444-4444-4444-4444-444444444444', 'Snacks y Golosinas', 'Papas fritas, galletas y chocolates')
ON CONFLICT (nombre) DO NOTHING;

-- Productos iniciales con códigos de barras listos para escáner
INSERT INTO productos (codigo_barras, nombre, precio_costo, precio_venta, stock_actual, stock_minimo, categoria_id) VALUES
('7771234567890', 'Coca Cola 2L', 10.00, 14.50, 45, 10, '11111111-1111-1111-1111-111111111111'),
('7771234567891', 'Leche Entera Pil 1L', 5.50, 7.00, 3, 10, '22222222-2222-2222-2222-222222222222'),
('7771234567892', 'Aceite Fino 1L', 11.00, 15.00, 20, 5, '33333333-3333-3333-3333-333333333333'),
('7771234567893', 'Papas Lays Clásicas 150g', 8.00, 12.00, 2, 5, '44444444-4444-4444-4444-444444444444'),
('7771234567894', 'Agua Mineral Vital 500ml', 2.00, 3.50, 60, 15, '11111111-1111-1111-1111-111111111111')
ON CONFLICT (codigo_barras) DO NOTHING;

-- Usuarios por defecto
INSERT INTO usuarios (nombre, apellido, ci, telefono, email, password_hash, rol) VALUES
('Administrador', 'QuickMart', '1234567', '70000001', 'admin@quickmart.com', 'admin123', 'administrador'),
('Carlos', 'Cajero', '7654321', '70000002', 'cajero@quickmart.com', 'cajero123', 'cajero')
ON CONFLICT (email) DO NOTHING;

-- Cliente por defecto "Sin Datos / Cliente Anónimo"
INSERT INTO clientes (nit_ci, razon_social, telefono, email) VALUES
('0', 'SIN DATOS / ANÓNIMO', '00000000', 'sin_datos@quickmart.com'),
('1234567019', 'Empresa Ejemplo S.R.L.', '77788990', 'contacto@ejemplo.com')
ON CONFLICT (nit_ci) DO NOTHING;
