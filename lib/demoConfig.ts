// Keep uploads off for the mentor preview until Firebase Storage billing is enabled.
// Set EXPO_PUBLIC_ENABLE_UPLOADS=true when Storage is available.
export const ENABLE_UPLOADS = process.env.EXPO_PUBLIC_ENABLE_UPLOADS === 'true';
