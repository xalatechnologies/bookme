/**
 * Utility function to parse WKB (Well-Known Binary) format to coordinates
 * This is a simplified parser for POINT geometries in WKB format
 * 
 * WKB format for POINT:
 * - 1 byte: endianess (1 = little endian, 0 = big endian)
 * - 4 bytes: geometry type (1 = POINT, but may include flags)
 * - 8 bytes: X coordinate (double)
 * - 8 bytes: Y coordinate (double)
 */

export function parseWKBPoint(wkb: string): { lat: number; lng: number } | null {
  try {
    // Convert hex string to bytes
    const matchResult = wkb.match(/.{1,2}/g);
    if (!matchResult) {
      return null;
    }
    const bytes = new Uint8Array(matchResult.map(byte => parseInt(byte, 16)));
    
    // Check endianess (first byte)
    const littleEndian = bytes[0] === 1;
    
    // Check geometry type (bytes 1-4)
    // The geometry type may include flags in the upper bits
    // We only care about the lower bits (geometry type)
    let geometryType = littleEndian 
      ? bytes[1] | (bytes[2] << 8) | (bytes[3] << 16) | (bytes[4] << 24)
      : (bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4];
    
    // Extract the base geometry type (lower 8 bits for 2D, or handle SRID flag)
    // Geometry type 1 = POINT
    // The value 536870913 (0x20000001) indicates POINT with SRID flag set
    const baseGeometryType = geometryType & 0x1FFFFFFF; // Mask out flags
    
    // Only handle POINT geometries (type 1)
    if (baseGeometryType !== 1) {
      console.warn('Unsupported geometry type:', geometryType, 'base type:', baseGeometryType);
      return null;
    }
    
    // Check if SRID flag is set (bit 29)
    const hasSrid = (geometryType & 0x20000000) !== 0;
    
    // Start position for coordinates
    let coordStartPos = 5;
    
    // If SRID flag is set, skip the SRID (4 bytes)
    if (hasSrid) {
      coordStartPos += 4;
    }
    
    // Extract coordinates
    const xBytes = bytes.slice(coordStartPos, coordStartPos + 8);
    const yBytes = bytes.slice(coordStartPos + 8, coordStartPos + 16);
    
    // Convert bytes to double
    const x = parseDouble(xBytes, littleEndian);
    const y = parseDouble(yBytes, littleEndian);
    
    // Return as { lat, lng } format
    return { lat: y, lng: x };
  } catch (error) {
    console.warn('Error parsing WKB point:', error);
    return null;
  }
}

function parseDouble(bytes: Uint8Array, littleEndian: boolean): number {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  
  if (littleEndian) {
    for (let i = 0; i < 8; i++) {
      view.setUint8(i, bytes[i]);
    }
  } else {
    for (let i = 0; i < 8; i++) {
      view.setUint8(i, bytes[7 - i]);
    }
  }
  
  return view.getFloat64(0, true); // true for little endian
}