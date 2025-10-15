let cachedVoices = [];

function refreshVoices() {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return [];
    const voices = synth.getVoices();
    if (voices && voices.length) cachedVoices = voices;
    return cachedVoices;
  } catch (_) {
    return [];
  }
}

// Public: return current voices (after hydration)
export function listVoices() {
  const voices = refreshVoices();
  // Some browsers populate voices asynchronously; attach a one-time listener
  if (!voices.length && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    };
  }
  return cachedVoices;
}

// Debug function to check available voices for Telugu
export function debugTeluguVoices() {
  const voices = refreshVoices();
  console.log('=== Telugu Voice Debug ===');
  console.log('Total voices available:', voices.length);
  
  const teluguVoices = voices.filter(v => 
    v.lang && (
      v.lang.includes('te') || 
      v.lang.includes('telugu') ||
      v.name.toLowerCase().includes('telugu') ||
      v.name.toLowerCase().includes('తెలుగు')
    )
  );
  
  console.log('Telugu-related voices found:', teluguVoices.length);
  teluguVoices.forEach(v => {
    console.log(`- ${v.name} (${v.lang})`);
  });
  
  const allVoices = voices.map(v => ({ name: v.name, lang: v.lang }));
  console.log('All available voices:', allVoices);
  
  return { teluguVoices, allVoices };
}

// Test function for Telugu audio
export function testTeluguAudio() {
  console.log('Testing Telugu audio...');
  debugTeluguVoices();
  
  const testText = 'భాష సేవ్ చేయబడింది'; // "Language saved" in Telugu
  console.log('Speaking test text:', testText);
  
  speak(testText, 'te-IN');
  
  // Also test with just 'te'
  setTimeout(() => {
    console.log('Testing with just "te" language code...');
    speak(testText, 'te');
  }, 3000);
}

// Force Telugu speech using default voice
export function forceTeluguSpeech(text) {
  try {
    const synth = window.speechSynthesis;
    if (!synth || !text) {
      console.log('Speech synthesis not available or no text provided');
      return;
    }
    
    console.log(`Force speaking Telugu: "${text}"`);
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'te-IN'; // Force Telugu language code
    utter.rate = 0.8;
    utter.pitch = 1;
    utter.volume = 1;
    
    utter.onstart = () => console.log('Force Telugu speech started');
    utter.onend = () => console.log('Force Telugu speech ended');
    utter.onerror = (e) => console.log('Force Telugu speech error:', e);
    
    synth.speak(utter);
  } catch (e) {
    console.error('Force Telugu speech error:', e);
  }
}

// Map simple language code to BCP-47 variants commonly available
function resolveLangCode(lang) {
  switch (lang) {
    case 'hi':
    case 'hi-IN':
      return 'hi-IN';
    case 'te':
    case 'te-IN':
      return 'te-IN';
    case 'ta':
    case 'ta-IN':
      return 'ta-IN';
    case 'kn':
    case 'kn-IN':
      return 'kn-IN';
    case 'mr':
    case 'mr-IN':
      return 'mr-IN';
    case 'bn':
    case 'bn-IN':
      return 'bn-IN';
    default:
      return 'en-IN';
  }
}

function findBestVoice(lang) {
  const code = resolveLangCode(lang);
  const voices = refreshVoices();
  
  console.log(`Looking for voice for language: ${lang} (resolved to: ${code})`);
  console.log(`Available voices:`, voices.map(v => ({ name: v.name, lang: v.lang })));
  
  // Exact lang match
  let v = voices.find(x => x.lang === code);
  if (v) {
    console.log(`Found exact match: ${v.name} (${v.lang})`);
    return v;
  }
  
  // Starts with match e.g. hi vs hi-IN
  v = voices.find(x => x.lang && x.lang.toLowerCase().startsWith(code.slice(0,2)));
  if (v) {
    console.log(`Found prefix match: ${v.name} (${v.lang})`);
    return v;
  }
  
  // Keyword-based match by voice name for local scripts
  const keywords = {
    'hi-IN': ['Hindi','हिन्दी','हिंदी'],
    'te-IN': ['Telugu','తెలుగు','te','telugu'],
    'ta-IN': ['Tamil','தமிழ்'],
    'kn-IN': ['Kannada','ಕನ್ನಡ'],
    'mr-IN': ['Marathi','मराठी'],
    'bn-IN': ['Bengali','Bangla','বাংলা'],
  };
  const ks = keywords[code] || [];
  v = voices.find(x => ks.some(k => (x.name || '').toLowerCase().includes(k.toLowerCase())));
  if (v) {
    console.log(`Found keyword match: ${v.name} (${v.lang})`);
    return v;
  }
  
  // Special handling for Telugu - try more variations
  if (code === 'te-IN') {
    // Try to find any voice that might work for Telugu
    v = voices.find(x => 
      x.lang && (
        x.lang.includes('te') || 
        x.lang.includes('telugu') ||
        x.name.toLowerCase().includes('telugu') ||
        x.name.toLowerCase().includes('తెలుగు')
      )
    );
    if (v) {
      console.log(`Found Telugu-specific match: ${v.name} (${v.lang})`);
      return v;
    }
    
    // For Telugu, try to find any Indian voice that might work
    v = voices.find(x => 
      x.lang && (
        x.lang.includes('IN') || 
        x.lang.includes('India') ||
        x.name.toLowerCase().includes('india') ||
        x.name.toLowerCase().includes('indian')
      )
    );
    if (v) {
      console.log(`Found Indian voice for Telugu: ${v.name} (${v.lang})`);
      return v;
    }
    
    // Last resort for Telugu - try any voice that's not English
    v = voices.find(x => 
      x.lang && !x.lang.toLowerCase().startsWith('en')
    );
    if (v) {
      console.log(`Using non-English voice for Telugu: ${v.name} (${v.lang})`);
      return v;
    }
    
    console.log('No Telugu-compatible voice found');
    return null;
  }
  
  // Fallback Indian English for other languages
  v = voices.find(x => x.lang === 'en-IN');
  if (v) {
    console.log(`Using Indian English fallback: ${v.name} (${v.lang})`);
    return v;
  }
  
  // Any English fallback for other languages
  v = voices.find(x => (x.lang || '').startsWith('en'));
  if (v) {
    console.log(`Using English fallback: ${v.name} (${v.lang})`);
    return v;
  }
  
  console.log('No suitable voice found, using default');
  return null;
}

export function speak(text, lang = 'en-IN') {
  try {
    const synth = window.speechSynthesis;
    if (!synth || !text) {
      console.log('Speech synthesis not available or no text provided');
      return;
    }
    
    console.log(`Attempting to speak: "${text}" in language: ${lang}`);
    
    // Cancel any ongoing speech
    synth.cancel();
    
    const attempt = () => {
      const utter = new SpeechSynthesisUtterance(text);
      const resolvedLang = resolveLangCode(lang);
      utter.lang = resolvedLang;
      
      const voice = findBestVoice(lang);
      if (voice) {
        utter.voice = voice;
        console.log(`Speaking in ${lang} using voice: ${voice.name} (${voice.lang})`);
      } else {
        console.log(`No specific voice found for ${lang}, using default`);
        // For Telugu, try multiple language code variations
        if (lang === 'te' || lang === 'te-IN') {
          console.log('Attempting Telugu language code variations...');
          // Try different Telugu language codes
          const teluguCodes = ['te-IN', 'te', 'telugu', 'te-IN-x-telugu'];
          const allVoices = refreshVoices();
          const foundVoice = teluguCodes.find(code => {
            const testVoice = allVoices.find(v => v.lang === code);
            if (testVoice) {
              utter.lang = code;
              utter.voice = testVoice;
              console.log(`Using Telugu voice with code ${code}: ${testVoice.name}`);
              return true;
            }
            return false;
          });
          
          if (!foundVoice) {
            console.log('No Telugu voice found with any language code');
          }
        }
      }
      
      utter.rate = 0.8; // slower for clarity
      utter.pitch = 1;
      utter.volume = 1;
      
      // Add event listeners for debugging
      utter.onstart = () => console.log('Speech started successfully');
      utter.onend = () => console.log('Speech ended');
      utter.onerror = (e) => {
        console.log('Speech error:', e);
        // Don't automatically fallback to English for Telugu - let the user know
        if ((lang === 'te' || lang === 'te-IN')) {
          console.log('Telugu speech failed:', e.error);
          console.log('Available voices:', refreshVoices().map(v => ({ name: v.name, lang: v.lang })));
        }
      };
      
      synth.speak(utter);
    };
    
    const voices = refreshVoices();
    console.log(`Available voices: ${voices.length}`);
    
    if (!voices.length && typeof synth.onvoiceschanged !== 'undefined') {
      console.log('Waiting for voices to load...');
      // Wait for voices to load
      const once = () => {
        synth.onvoiceschanged = null;
        console.log('Voices loaded, attempting speech...');
        setTimeout(attempt, 200);
      };
      synth.onvoiceschanged = once;
      // Fallback timer
      setTimeout(() => {
        console.log('Fallback timer triggered, attempting speech...');
        attempt();
      }, 1500);
    } else {
      // Small delay to ensure voices are ready
      setTimeout(attempt, 200);
    }
  } catch (e) {
    console.error('Speech synthesis error:', e);
  }
}

export function listen(onResult, onError) {
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError && onError(new Error('Speech recognition not supported'));
      return () => {};
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult && onResult(transcript);
    };
    recognition.onerror = (e) => onError && onError(e);
    recognition.start();
    return () => recognition.stop();
  } catch (e) {
    onError && onError(e);
    return () => {};
  }
}