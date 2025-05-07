/**
 * Represents the reputation information for a domain.
 */
export interface Reputation {
  /**
   * The reputation score of the domain (0-100, where 0 is very malicious and 100 is very safe).
   */
  reputationScore: number;
  /**
   * A description of why the domain has this reputation
   */
  reputationDescription: string;
  /**
   * The safety category of the domain based on its reputation.
   */
  category: 'Super Safe' | 'Safe' | 'Medium' | 'Low' | 'Critical' | 'Unknown';
}

/**
 * Asynchronously retrieves the reputation of a domain.
 *
 * @param url The full URL to check.
 * @returns A promise that resolves to a Reputation object.
 */
export async function getReputation(url: string): Promise<Reputation> {
  let domainToCheck: string;
  try {
    domainToCheck = new URL(url).hostname.replace(/^www\./, '');
  } catch (error) {
    // Invalid URL, assign a low score or handle as an error case
    return {
      reputationScore: 10,
      reputationDescription: 'Invalid URL provided. Unable to assess reputation.',
      category: 'Critical',
    };
  }

  // Super Safe sites
  const superSafeDomains = ['google.com', 'youtube.com', 'amazon.com', 'wikipedia.org', 'facebook.com', 'twitter.com', 'linkedin.com', 'microsoft.com', 'apple.com', 'github.com', 'stackoverflow.com', 'developer.mozilla.org'];
  if (superSafeDomains.includes(domainToCheck)) {
    return {
      reputationScore: Math.floor(Math.random() * 10) + 90, // 90-99
      reputationDescription: 'This is a globally recognized and highly trusted domain with excellent security practices.',
      category: 'Super Safe',
    };
  }

  // Potentially critical sites (example: .onion)
  if (domainToCheck.endsWith('.onion')) {
    return {
      reputationScore: Math.floor(Math.random() * 20), // 0-19
      reputationDescription: 'Accessing .onion sites carries inherent risks. This domain is part of the Tor network and may host illicit content or pose security threats.',
      category: 'Critical',
    };
  }
  
  // Known suspicious TLDs or patterns (examples)
  const suspiciousTlds = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.loan', '.work', '.club'];
  if (suspiciousTlds.some(tld => domainToCheck.endsWith(tld))) {
     // Give them a higher chance of being low or medium
    if (Math.random() < 0.7) { // 70% chance to be low
        return {
            reputationScore: Math.floor(Math.random() * 20) + 30, // 30-49
            reputationDescription: 'This domain uses a TLD often associated with spam or malicious activities. Caution is advised.',
            category: 'Low',
        };
    }
  }


  // Example pirated/illegal content sites (keywords)
  const lowReputationKeywords = ['katmovies', 'zxcstream', '123movies', 'fmovies', 'putlocker', 'piratebay', 'torrent', 'yts', 'rarbg', 'sockshare', 'ganool'];
  if (lowReputationKeywords.some(keyword => domainToCheck.includes(keyword))) {
    return {
      reputationScore: Math.floor(Math.random() * 20) + 30, // 30-49
      reputationDescription: 'This domain is associated with content piracy or other questionable activities. Caution is strongly advised.',
      category: 'Low',
    };
  }

  // Simulate other categories based on domain hash or length for variety
  // A simple hash-like function for pseudo-random distribution
  const hash = domainToCheck.split('').reduce((acc, char) => acc + char.charCodeAt(0) * (acc % 13 + 1) , 0) % 100;

  if (hash < 5) { // 5% chance for Critical
    return {
      reputationScore: Math.floor(Math.random() * 20) + 10, // 10-29
      reputationDescription: 'This domain exhibits characteristics that may indicate potential security risks. Exercise extreme caution.',
      category: 'Critical',
    };
  } else if (hash < 20) { // 15% chance for Low (added to keyword matches)
    return {
      reputationScore: Math.floor(Math.random() * 20) + 30, // 30-49
      reputationDescription: 'This domain has a lower reputation score. Proceed with caution and verify its legitimacy.',
      category: 'Low',
    };
  } else if (hash < 45) { // 25% chance for Medium
    return {
      reputationScore: Math.floor(Math.random() * 20) + 50, // 50-69
      reputationDescription: 'This domain has a moderate reputation. Some aspects may warrant caution, ensure it is the intended site.',
      category: 'Medium',
    };
  } else { // 55% chance for Safe (default for most others)
    return {
      reputationScore: Math.floor(Math.random() * 20) + 70, // 70-89
      reputationDescription: 'This domain generally has a good reputation. Standard security practices are recommended.',
      category: 'Safe',
    };
  }
}