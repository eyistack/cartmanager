// List of known disposable / temporary email domains to block
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'sharklasers.com',
  'trashmail.com',
  'yopmail.com',
  'getairmail.com',
  'dispostable.com',
  'throwawaymail.com',
  'nada.ltd',
  'getnada.com',
  'mohmal.com',
  'fakeinbox.com',
  'crazymailing.com',
  'burnermail.io',
  'dropmail.me',
  'inboxkitten.com',
  'tempinbox.com',
  'fakemailgenerator.com',
  'mytemp.email',
  'maildrop.cc',
  'generator.email',
  'emailondeck.com',
  'tempmailo.com',
  'temporary-mail.net',
  'minuteinbox.com',
  'trashmail.net',
  'trashmail.me',
  'trashmail.org',
  'wegwerfmail.de',
  'pokemail.net',
  'tempr.email',
  'discard.email',
  'spambog.com',
  'spambog.de',
  'spamgourmet.com',
  'mailcatch.com',
  'binkmail.com',
  'bobmail.info',
  'chacuo.net',
  'devnullmail.com',
  'meltmail.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'tinemail.com',
]);

/**
 * Validates whether an email format is valid and not from a disposable temp-mail provider.
 */
export function validateGenuineEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();
  
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }

  // Standard email format regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g., name@gmail.com).' };
  }

  const domain = trimmed.split('@')[1];
  if (!domain) {
    return { isValid: false, error: 'Invalid email domain.' };
  }

  // Check against known disposable domains
  if (
    DISPOSABLE_DOMAINS.has(domain) || 
    domain.includes('temp') || 
    domain.includes('disposable') || 
    domain.includes('throwaway') || 
    domain.includes('fakemail') ||
    domain.includes('burner') ||
    domain.includes('mailinator')
  ) {
    return { 
      isValid: false, 
      error: 'Temporary or disposable emails are not permitted. Please use a genuine email provider (e.g., Gmail, Outlook, Yahoo, Proton, iCloud).' 
    };
  }

  // Verify domain has valid structure
  const parts = domain.split('.');
  if (parts.some(p => p.length === 0)) {
    return { isValid: false, error: 'Invalid email domain format.' };
  }

  return { isValid: true };
}
