/**
 * Resilient 3-Tier Clipboard Engine for Mobile Browsers & In-App WebViews
 * Solves clipboard permission denials in Telegram webview, Opera Mini, and older Safari
 */

export interface CopyResult {
  success: boolean;
  tierUsed: 'NATIVE' | 'EXEC_COMMAND' | 'FAILED';
  error?: string;
}

export async function copyToClipboardSafe(text: string): Promise<CopyResult> {
  // Tier 1: Modern navigator.clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      triggerHapticFeedback();
      return { success: true, tierUsed: 'NATIVE' };
    } catch (err) {
      console.warn('Tier 1 (navigator.clipboard) failed, falling back to Tier 2:', err);
    }
  }

  // Tier 2: Hidden textarea execCommand fallback
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);

      // iOS Safari specific selection range
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, text.length);

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        triggerHapticFeedback();
        return { success: true, tierUsed: 'EXEC_COMMAND' };
      }
    } catch (fallbackErr) {
      console.warn('Tier 2 (execCommand) failed:', fallbackErr);
    }
  }

  // Tier 3: Trigger manual modal fallback
  return { 
    success: false, 
    tierUsed: 'FAILED', 
    error: 'Clipboard permissions denied. Manual selection required.' 
  };
}

function triggerHapticFeedback(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(50);
    } catch {
      // Ignored if device doesn't support or disallows vibration
    }
  }
}
