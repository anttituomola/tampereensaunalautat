import type { NextApiRequest, NextApiResponse } from 'next';

type VerificationResponse = {
  isValid: boolean;
  message?: string;
  error?: string;
  details?: Record<string, any>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerificationResponse>
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ isValid: false, error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ isValid: false, error: 'Email is required' });
  }

  try {
    // Call Abstract API for email validation
    const apiKey = process.env.ABSTRACT_API_KEY;

    if (!apiKey) {
      console.error('Missing ABSTRACT_API_KEY environment variable');
      // Fallback to basic validation if API key is missing
      return res.status(200).json({
        isValid: true,
        message: 'Validation skipped: API key not configured',
      });
    }

    // Format the API URL exactly as shown in the documentation
    const apiUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(
      email
    )}`;
    console.log('Calling Abstract API:', apiUrl.replace(apiKey, 'REDACTED'));

    // Make API request with simple GET as shown in documentation
    const options = { method: 'GET' };
    const response = await fetch(apiUrl, options);

    // Log response status
    console.log('Abstract API response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API error response:', errorBody);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response data:', JSON.stringify(data, null, 2));

    // Evaluate the validation results according to documentation
    const isValid = data.deliverability === 'DELIVERABLE';

    // Add more details to the response
    const validationDetails = {
      // Include other useful information from the API response
      qualityScore: data.quality_score,
      isFreeEmail: data.is_free_email?.value,
      isDisposableEmail: data.is_disposable_email?.value,
      isValidFormat: data.is_valid_format?.value,
    };

    return res.status(200).json({
      isValid,
      message: isValid ? 'Email is valid' : 'Email validation failed',
      details: validationDetails,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    // Default to permissive behavior on API errors to avoid blocking legitimate users
    return res.status(200).json({
      isValid: true,
      message: 'Validation skipped due to API error',
    });
  }
}
