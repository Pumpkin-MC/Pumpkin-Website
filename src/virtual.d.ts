declare module "virtual:snippet-tokens" {
  export type SnippetToken = [content: string, color?: string];

  export const snippetTokens: Record<string, SnippetToken[][]>;
}
