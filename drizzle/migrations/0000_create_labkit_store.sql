CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,3) NOT NULL,
  image text NOT NULL,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,3) NOT NULL DEFAULT 0,
  total numeric(10,3) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KWD',
  payment_status text NOT NULL DEFAULT 'pending',
  order_status text NOT NULL DEFAULT 'pending',
  stripe_session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_stripe_session_id_idx ON public.orders (stripe_session_id);

GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.products (name, description, price, image, category, stock) VALUES
('USB-C Hub', '7-in-1 aluminium hub with HDMI, USB 3.0, SD reader and 100W pass-through charging. Perfect for laptops with limited ports during lab sessions.', 12.500, '/images/products/usb-c-hub.jpg', 'Essential Tools', 24),
('USB Flash Drive', '128GB USB 3.2 flash drive with metal casing and fast read speeds. Ideal for moving project builds between lab machines.', 3.750, '/images/products/usb-flash-drive.jpg', 'Essential Tools', 60),
('External SSD', '1TB portable NVMe SSD with USB-C, up to 1050MB/s. Keeps virtual machines and datasets close at hand.', 24.900, '/images/products/external-ssd.jpg', 'Essential Tools', 15),
('HDMI Cable', '2m high-speed HDMI 2.1 cable supporting 4K at 120Hz. Braided jacket built for daily plugging and unplugging.', 2.500, '/images/products/hdmi-cable.jpg', 'Essential Tools', 45),
('Ethernet Cable', '3m Cat 6 shielded ethernet cable for stable low-latency lab and dorm connections.', 1.750, '/images/products/ethernet-cable.jpg', 'Essential Tools', 50),
('USB-C Cable', '1.5m braided USB-C to USB-C cable with 100W power delivery and 10Gbps data transfer.', 2.250, '/images/products/usb-c-cable.jpg', 'Essential Tools', 70),
('Laptop Stand', 'Adjustable aluminium laptop stand that raises your screen to eye level and improves airflow during long compiles.', 9.500, '/images/products/laptop-stand.jpg', 'Essential Tools', 20),
('Wireless Mouse', 'Silent-click wireless mouse with 2.4GHz and Bluetooth, 4000 DPI and a rechargeable battery.', 6.750, '/images/products/wireless-mouse.jpg', 'Essential Tools', 32),
('Mechanical Keyboard', '75% hot-swappable mechanical keyboard with tactile switches and PBT keycaps. Built for hours of coding.', 22.000, '/images/products/mechanical-keyboard.jpg', 'Essential Tools', 12),
('Headphones', 'Over-ear headphones with active noise cancelling and 40h battery for focused study sessions.', 18.500, '/images/products/headphones.jpg', 'Essential Tools', 18),
('Arduino Uno', 'Arduino Uno R3 compatible board with ATmega328P, USB cable included. The classic starting point for embedded courses.', 8.900, '/images/products/arduino-uno.jpg', 'Electronics & Development', 40),
('Raspberry Pi', 'Raspberry Pi 5 single-board computer, 4GB RAM. Great for OS, networking and IoT projects.', 32.000, '/images/products/raspberry-pi.jpg', 'Electronics & Development', 10),
('Breadboard', '830 tie-point solderless breadboard with power rails and adhesive back.', 1.900, '/images/products/breadboard.jpg', 'Electronics & Development', 55),
('Jumper Wires', '120-piece jumper wire set: male-male, male-female and female-female in multiple lengths.', 1.500, '/images/products/jumper-wires.jpg', 'Electronics & Development', 65),
('Resistor Kit', '600-piece resistor kit, 30 values from 10 ohm to 1M ohm, organised in a labelled case.', 2.750, '/images/products/resistor-kit.jpg', 'Electronics & Development', 38),
('Sensor Kit', '16-in-1 sensor kit including temperature, ultrasonic, IR, tilt and light sensors for microcontroller projects.', 14.500, '/images/products/sensor-kit.jpg', 'Electronics & Development', 0),
('USB-to-Serial Adapter', 'CP2102 USB to TTL serial adapter for flashing microcontrollers and reading debug output.', 4.250, '/images/products/usb-to-serial-adapter.jpg', 'Electronics & Development', 28),
('Laptop Sleeve', 'Water-resistant 14-inch laptop sleeve with padded interior and a front pocket for chargers.', 5.900, '/images/products/laptop-sleeve.jpg', 'Student Essentials', 26),
('Cable Organizer', 'Magnetic silicone cable organiser set that keeps desk cables tidy and labelled.', 2.100, '/images/products/cable-organizer.jpg', 'Student Essentials', 48),
('Notebook', 'A5 dotted-grid engineering notebook, 160 pages of 100gsm paper for diagrams and pseudocode.', 1.250, '/images/products/notebook.jpg', 'Student Essentials', 80),
('Desk Lamp', 'LED desk lamp with three colour temperatures, stepless dimming and a USB charging port.', 7.500, '/images/products/desk-lamp.jpg', 'Student Essentials', 22),
('Scientific Calculator', '417-function scientific calculator approved for engineering exams, with dual power.', 11.000, '/images/products/scientific-calculator.jpg', 'Student Essentials', 30);