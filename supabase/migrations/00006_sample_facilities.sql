-- ============================================
-- Sample Facilities for Testing
-- ============================================
-- These are example facilities. Replace with real data via CSV import later.

INSERT INTO public.facilities (name, address, facility_type, latitude, longitude) VALUES
  ('Sunrise Senior Living', '123 Main Street, Seattle, WA 98101', 'AL', 47.6062, -122.3321),
  ('Evergreen Care Center', '456 Oak Avenue, Bellevue, WA 98004', 'SNF', 47.6101, -122.2015),
  ('Pacific Heights Hospice', '789 Pine Road, Tacoma, WA 98402', 'Hospice', 47.2529, -122.4443),
  ('Mountain View IL Community', '321 Cedar Lane, Kirkland, WA 98033', 'IL', 47.6769, -122.2060),
  ('Cascade Nursing Facility', '555 Maple Drive, Redmond, WA 98052', 'SNF', 47.6740, -122.1215),
  ('Harbor View Assisted Living', '888 Harbor Blvd, Olympia, WA 98501', 'AL', 47.0379, -122.9007),
  ('Puget Sound Memory Care', '222 Bay Street, Everett, WA 98201', 'AL', 47.9790, -122.2021),
  ('Northwest Hospice House', '444 Forest Way, Spokane, WA 99201', 'Hospice', 47.6588, -117.4260),
  ('Valley Independent Living', '666 Valley Road, Yakima, WA 98901', 'IL', 46.6021, -120.5059),
  ('Columbia Care SNF', '777 River Drive, Vancouver, WA 98660', 'SNF', 45.6387, -122.6615);

-- Verify facilities were added
SELECT name, facility_type, address FROM public.facilities ORDER BY name;
