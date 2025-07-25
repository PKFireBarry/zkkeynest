// Quick debug script to test feedback API
const testFeedback = async () => {
  try {
    const response = await fetch('https://zkkeynest.space/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'bug',
        message: 'This is a test feedback message to debug the issue',
        email: 'test@example.com'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (!response.ok) {
      console.error('Error response:', data);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

testFeedback();