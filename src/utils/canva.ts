export function getCanvaEmbedUrl(inputUrl: string): string {
  if (!inputUrl || !inputUrl.trim()) {
    return 'https://www.canva.com/design/DAGfsK7x68U/view?embed';
  }

  let cleanUrl = inputUrl.trim();

  // If user pasted full iframe tag: <iframe src="https://..."></iframe>
  const iframeMatch = cleanUrl.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    cleanUrl = iframeMatch[1];
  }

  // Convert canva.com/design/.../edit or /view to /view?embed
  if (cleanUrl.includes('canva.com/design/')) {
    // Remove query params first if any
    const [baseUrl] = cleanUrl.split('?');
    // Replace trailing /edit or similar with /view
    let viewUrl = baseUrl;
    if (viewUrl.endsWith('/edit')) {
      viewUrl = viewUrl.replace(/\/edit$/, '/view');
    } else if (!viewUrl.endsWith('/view')) {
      // If it doesn't end with /view, check if it ends with /watch or design code
      if (!/\/view$/.test(viewUrl)) {
        viewUrl = `${viewUrl}/view`;
      }
    }
    return `${viewUrl}?embed`;
  }

  return cleanUrl;
}
