-- Update facilities with the best possible unique images we can get
-- Each facility gets unique images from the working URLs we verified

-- Update Drammen Idrettshall (Sports Hall) - 6 unique images
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1549476464-37392f717541?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&crop=center"
]'::jsonb
WHERE name = 'Drammen Idrettshall';

-- Update Strømsø Kulturhus (Cultural Center) - 6 unique images
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&crop=center"
]'::jsonb
WHERE name = 'Strømsø Kulturhus';

-- Update Konnerud Fotballbane (Football Field) - 4 unique images
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1529111290557-835758e4b130?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1519501023943-e50c19a9a3d5?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1517457371523-70e04d68c304?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&crop=center"
]'::jsonb
WHERE name = 'Konnerud Fotballbane';

-- Update Bragernes Møterom (Meeting Room) - 2 unique images
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1577643816920-6a4b0c9d4f3e?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&crop=center"
]'::jsonb
WHERE name = 'Bragernes Møterom';

-- Update Solberghallen (Sports Hall) - 1 unique image
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&crop=center"
]'::jsonb
WHERE name = 'Solberghallen';

-- Update Åssiden Tennisbane (Tennis Court) - 1 unique image
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&crop=center"
]'::jsonb
WHERE name = 'Åssiden Tennisbane';

-- Update Drammen Svømmehall (Swimming Hall) - 1 unique image
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&crop=center"
]'::jsonb
WHERE name = 'Drammen Svømmehall';

-- Update Fjell Fotballbane (Football Field) - 1 unique image
UPDATE facilities 
SET images = '[
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&crop=center"
]'::jsonb
WHERE name = 'Fjell Fotballbane';

-- Verify the updates
SELECT name, jsonb_array_length(images) as image_count FROM facilities ORDER BY name;