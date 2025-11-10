-- Update all facilities with unique images provided by user
-- Each facility gets specific images you selected

-- Update Fjell Fotballbane
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Zm90YmFsbHxlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm90YmFsbHxlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Zm90YmFsbHxlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vdGJhbGwlMjBmaWVsZHxlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900"
]'::jsonb
WHERE name = 'Fjell Fotballbane';

-- Update Konnerud Fotballbane
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c29jY2VyJTIwZmllbGR8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1531861218190-f90c89febf69?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c29jY2VyJTIwZmllbGR8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1625187538367-6a8483a79cc2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHNvY2NlciUyMGZpZWxkfGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1528656685602-17a25fe7abcd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHNvY2NlciUyMGZpZWxkfGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900"
]'::jsonb
WHERE name = 'Konnerud Fotballbane';

-- Update Drammen Svømmehall
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1558617320-e695f0d420de?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3dpbW1pbmclMjBwb29sfGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1607309661874-cbca4c0e8682?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDV8fHN3aW1taW5nJTIwcG9vbHxlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1461567933755-6c82be2197da?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fHN3aW1taW5nJTIwcG9vbHxlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1690125408806-bb88519d83c7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTI1fHxzd2ltbWluZyUyMHBvb2x8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070"
]'::jsonb
WHERE name = 'Drammen Svømmehall';

-- Update Åssiden Tennisbane
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fHRlbm5pcyUyMGNvdXJ0fGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1519611103964-90f61a50d3e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzV8fHRlbm5pcyUyMGNvdXJ0fGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1650496760462-cb983aca287d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTg4fHx0ZW5uaXMlMjBjb3VydHxlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1602012846858-0727988e215b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjI1fHx0ZW5uaXMlMjBjb3VydHxlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1622669253059-e345500cf0e9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRlbm5pcyUyMGNvdXJ0fGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900"
]'::jsonb
WHERE name = 'Åssiden Tennisbane';

-- Update Solberghallen
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1741940513798-4ce04b95ffda?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Z3ltJTIwY291cnR8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1559369064-c4d65141e408?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1701272873248-ee041b51b02b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGd5bSUyMGNvdXJ0fGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1641352848874-c96659e03144?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGd5bSUyMGNvdXJ0fGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1648924413770-9c650ee3c033?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fGd5bSUyMGNvdXJ0fGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900"
]'::jsonb
WHERE name = 'Solberghallen';

-- Update Bragernes Møterom
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1462826303086-329426d1aef5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVldGluZyUyMHJvb21zfGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVldGluZyUyMHJvb21zfGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWVldGluZyUyMHJvb21zfGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1717414477663-a5f5384499b0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fG1lZXRpbmclMjByb29tc3xlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1703355685952-03ed19f70f51?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fG1lZXRpbmclMjByb29tc3xlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900"
]'::jsonb
WHERE name = 'Bragernes Møterom';

-- Update Strømsø Kulturhus
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2071",
  "https://images.unsplash.com/photo-1621976498727-9e5d56476276?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dGVhdHJlfGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1589045548886-99431216faac?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fHRlYXRyZXxlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1627884812866-51f842389ee5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fHRlYXRyZXxlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1615414047026-802692414b79?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2069"
]'::jsonb
WHERE name = 'Strømsø Kulturhus';

-- Update Drammen Idrettshall
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1720716429002-cf8206d582b5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fFNwb3J0c2hhbGx8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1761971974992-6df33df97c3a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fFRyYWluaW5nJTIwZmFjaWxpdHl8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1594027674775-5ed49697e1da?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fFRyYWluaW5nJTIwZmFjaWxpdHl8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1637666067348-7303e7007363?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzZ8fFRyYWluaW5nJTIwZmFjaWxpdHl8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&q=60&w=900",
  "https://images.unsplash.com/photo-1738321791421-232f9ee2c487?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTg3fHxUcmFpbmluZyUyMGZhY2lsaXR5fGVufDB8fDB8fHwy&auto=format&fit=crop&q=60&w=900"
]'::jsonb
WHERE name = 'Drammen Idrettshall';

-- Verify the updates
SELECT name, jsonb_array_length(images) as image_count FROM facilities ORDER BY name;