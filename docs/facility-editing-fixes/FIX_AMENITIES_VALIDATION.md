# Amenities Validation Fix

## Problem
When adding amenities in the "Fasiliteter" tab, users were encountering a 400 error:
```
Failed to load resource: the server responded with a status of 400 ()
```

This was caused by the database validation trigger that requires all amenities to be valid keys from the `localized_db_values` table. When users entered free text that didn't match the predefined amenity keys, the validation failed.

## Root Cause
The database has a validation trigger `validate_facilities_amenities_trigger` that checks if all amenities in the JSONB array exist as valid keys in the `localized_db_values` table with `entity_type = 'amenity'`.

Valid amenity keys are:
- garderober
- dusj
- parkering
- lyd-lys
- tribuner
- scene
- projektor
- kjøkken
- kunstgress
- flombelysning
- 25m-basseng
- cafeteria
- innendørs
- profesjonell-underlag
- utstyr-utleie
- redningsutstyr
- wifi
- whiteboard
- fotball
- basketball

## Solution
Replaced the free text input field with a dropdown selection that only allows valid amenity keys to be selected and added to the facility.

### UI Changes
1. Replaced the text input with a select dropdown containing all valid amenity options
2. Removed the "Legg til" (Add) button as it's no longer needed with dropdown selection
3. Added automatic addition of amenities when selected from the dropdown
4. Maintained the existing tag display and removal functionality

### Implementation Details
```jsx
<select
  onChange={(e) => {
    if (e.target.value) {
      handleTagAdd(e.target.value);
      e.target.value = '';
    }
  }}
  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
>
  <option value="">Velg en fasilitet...</option>
  <option value="garderober">Garderober</option>
  <option value="dusj">Dusj</option>
  <option value="parkering">Parkering</option>
  <option value="lyd-lys">Lyd/lys</option>
  <option value="tribuner">Tribuner</option>
  <option value="scene">Scene</option>
  <option value="projektor">Projektor</option>
  <option value="kjøkken">Kjøkken</option>
  <option value="kunstgress">Kunstgress</option>
  <option value="flombelysning">Flombelysning</option>
  <option value="25m-basseng">25m basseng</option>
  <option value="cafeteria">Cafeteria</option>
  <option value="innendørs">Innendørs</option>
  <option value="profesjonell-underlag">Profesjonell underlag</option>
  <option value="utstyr-utleie">Utstyr utleie</option>
  <option value="redningsutstyr">Redningsutstyr</option>
  <option value="wifi">WiFi</option>
  <option value="whiteboard">Whiteboard</option>
  <option value="fotball">Fotball</option>
  <option value="basketball">Basketball</option>
</select>
```

## Benefits
1. **Prevents Validation Errors**: Users can only select from valid amenity keys, preventing database validation errors
2. **User-Friendly**: Provides a clear list of available amenities instead of requiring users to remember valid keys
3. **Consistency**: Ensures all facilities use consistent amenity naming
4. **Extensibility**: Easy to add new amenities by updating the dropdown and adding them to the `localized_db_values` table

## Testing
The implementation has been tested and verified:
1. Dropdown displays all valid amenity options
2. Selection adds the amenity correctly to the facility
3. Added amenities pass database validation
4. Facilities can be saved without validation errors
5. Existing tag display and removal functionality still works

## Future Improvements
1. Fetch the list of valid amenities dynamically from the database instead of hardcoding them
2. Add search functionality to the dropdown for easier selection when the list grows
3. Implement multi-select functionality for faster amenity addition