/** URL-safe random token for public registration links. */
export function generateToken(bytes = 18): string {
  const arr = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(arr);
  // base64url without padding
  let b64 = '';
  if (typeof Buffer !== 'undefined') {
    b64 = Buffer.from(arr).toString('base64');
  } else {
    b64 = btoa(String.fromCharCode(...arr));
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
