const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// @route   POST /api/chat
// @access  Private
const chat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const systemPrompt = `You are an intelligent academic assistant for the Smart Student Tracker system. 
You help students, teachers, and admins with academic performance questions.

Your role:
- Help students understand their grades and suggest improvement strategies
- Help teachers analyze student performance patterns
- Provide study tips and subject-specific advice
- Answer questions about academic performance data

Current user role: ${req.user.role}
Current user name: ${req.user.name}

${context ? `Academic context: ${JSON.stringify(context)}` : ''}

Keep responses concise, friendly, and actionable. Focus on academic improvement.
Do not discuss topics unrelated to education and academic performance.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ message: 'Chatbot error', error: error.message });
  }
};

module.exports = { chat };