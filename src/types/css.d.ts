// Type declaration for CSS module imports
// Allows TypeScript to resolve CSS file imports without errors
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
