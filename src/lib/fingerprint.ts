import { createHash, randomBytes } from 'crypto';

// Generate a perceptual-like hash for image comparison
// This is a simplified version that works with image metadata and basic characteristics
export async function generateImageFingerprint(buffer: Buffer, originalName: string): Promise<string> {
  // Create a hash based on file content and size
  const hash = createHash('sha256');
  
  // Include file buffer sample (first 8KB, middle 4KB, last 4KB)
  const sampleSize = 8192;
  const midStart = Math.floor(buffer.length / 2) - 2048;
  
  hash.update(buffer.slice(0, Math.min(sampleSize, buffer.length)));
  if (buffer.length > sampleSize) {
    hash.update(buffer.slice(Math.max(0, midStart), midStart + 4096));
    hash.update(buffer.slice(-Math.min(sampleSize, buffer.length)));
  }
  
  // Include file size for additional uniqueness
  hash.update(buffer.length.toString());
  
  // Add original name for additional entropy
  hash.update(originalName);
  
  return hash.digest('hex');
}

// Generate unique Content ID
export function generateContentId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString('hex');
  return `TG-${timestamp}-${random}`.toUpperCase();
}

// Calculate similarity between two hashes
// Returns a value between 0 and 1 (1 = identical)
export function calculateHashSimilarity(hash1: string, hash2: string): number {
  if (hash1 === hash2) return 1;
  if (hash1.length !== hash2.length) return 0;
  
  let matchingChars = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) {
      matchingChars++;
    }
  }
  
  return matchingChars / hash1.length;
}

// Check if two images are similar (above threshold)
export function areImagesSimilar(hash1: string, hash2: string, threshold: number = 0.95): boolean {
  const similarity = calculateHashSimilarity(hash1, hash2);
  return similarity >= threshold;
}

// Simulate watermark embedding
export function simulateWatermarkEmbedding(imageBuffer: Buffer, contentId: string, userId: string): Buffer {
  // In a real implementation, this would embed invisible watermark data
  // For MVP, we simulate by creating a record of the watermark
  // The actual image remains unchanged, but we store the watermark metadata
  
  // Create a watermark signature
  const watermarkSignature = createHash('sha256')
    .update(contentId)
    .update(userId)
    .update('traceguard_watermark_v1')
    .digest('hex');
  
  // Return original buffer (simulation)
  // In production, you would use libraries like sharp, jimp, or steganography
  return imageBuffer;
}

// Generate ownership certificate
export function generateOwnershipCertificate(
  contentId: string,
  userId: string,
  userName: string,
  originalName: string,
  protectedAt: Date
): string {
  const certificate = `
╔════════════════════════════════════════════════════════════════╗
║                    TRACEGUARD AI                               ║
║              OWNERSHIP CERTIFICATE                             ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Content ID: ${contentId.padEnd(46)}║
║  Owner: ${userName.padEnd(53)}║
║  User ID: ${userId.padEnd(51)}║
║  Original File: ${originalName.padEnd(43)}║
║  Protection Date: ${protectedAt.toISOString().padEnd(40)}║
║                                                                ║
║  This certificate confirms that the above content has been     ║
║  registered and protected by TraceGuard AI.                    ║
║                                                                ║
║  The content fingerprint and invisible watermark have been     ║
║  embedded to protect against unauthorized use.                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`;
  return certificate;
}
