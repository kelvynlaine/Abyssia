const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const streamChat = async (messages, onUpdate, onComplete, onError) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'http://localhost:5173', // Required by OpenRouter
        'X-Title': 'Liquid Glass Chatbot', // Required by OpenRouter
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let fullContent = '';
    let buffer = '';

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split('\n');
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
            try {
              const data = JSON.parse(trimmedLine.slice(6));
              const text = data.choices[0]?.delta?.content || '';
              fullContent += text;
              onUpdate(fullContent);
            } catch (e) {
              console.error('Error parsing stream data', e, trimmedLine);
            }
          }
        }
      }
    }
    
    onComplete(fullContent);
  } catch (error) {
    onError(error.message);
  }
};
