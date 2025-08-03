import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

// Main App component
const App = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState('');
  const [resultType, setResultType] = useState(null); // 'analysis', 'recipe', or 'alternative'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
      setResult('');
      setResultType(null);
    }
  };

  // Convert file to Base64 string
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });

  // Function to analyze the image using Gemini API
  const analyzeImage = async () => {
    if (!imageFile) {
      setError('Proszę wybrać zdjęcie jedzenia.');
      return;
    }

    setLoading(true);
    setResult('');
    setResultType(null);
    setError('');

    try {
      const base64ImageData = await toBase64(imageFile);
      const prompt = `Identify the food in this image and provide an estimated calorie count, a brief description of the meal, and a breakdown of its macronutrients (protein, fat, carbohydrates). Also, provide an explanation of the factors considered for the estimation. Respond in Polish.`;

      const payload = {
        contents: [{
          role: "user",
          parts: [{
            text: prompt
          }, {
            inlineData: {
              mimeType: imageFile.type,
              data: base64ImageData
            }
          }]
        }],
      };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Błąd API: ${response.status} ${response.statusText}`);
      }

      const apiResult = await response.json();
      const text = apiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setResult(text);
        setResultType('analysis');
      } else {
        setError('Brak odpowiedzi od AI. Spróbuj ponownie.');
      }
    } catch (err) {
      console.error(err);
      setError('Wystąpił błąd podczas analizy. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  // Function to generate a recipe using Gemini API
  const generateRecipe = async () => {
    if (!result || resultType !== 'analysis') {
      setError('Proszę najpierw zeskanować jedzenie.');
      return;
    }

    setLoading(true);
    setResult('');
    setResultType(null);
    setError('');

    try {
      // The prompt uses the existing analysis result to provide context
      const prompt = `Based on the following food analysis: "${result}", please generate a detailed recipe for the meal. The recipe should include a list of ingredients and step-by-step instructions. Respond in Polish.`;
      
      const payload = {
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
      };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Błąd API: ${response.status} ${response.statusText}`);
      }

      const apiResult = await response.json();
      const text = apiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setResult(text);
        setResultType('recipe');
      } else {
        setError('Brak odpowiedzi od AI. Spróbuj ponownie.');
      }
    } catch (err) {
      console.error(err);
      setError('Wystąpił błąd podczas generowania przepisu. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  // Function to suggest a healthier alternative using Gemini API
  const suggestAlternative = async () => {
    if (!result || resultType !== 'analysis') {
      setError('Proszę najpierw zeskanować jedzenie.');
      return;
    }

    setLoading(true);
    setResult('');
    setResultType(null);
    setError('');

    try {
      // The prompt uses the existing analysis result to provide context
      const prompt = `Based on the following food analysis: "${result}", please suggest a healthier alternative meal. Provide a brief description of the alternative and compare its macronutrient and calorie values to the original meal. Respond in Polish.`;
      
      const payload = {
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
      };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Błąd API: ${response.status} ${response.statusText}`);
      }

      const apiResult = await response.json();
      const text = apiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setResult(text);
        setResultType('alternative');
      } else {
        setError('Brak odpowiedzi od AI. Spróbuj ponownie.');
      }
    } catch (err) {
      console.error(err);
      setError('Wystąpił błąd podczas sugerowania alternatywy. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 w-full max-w-lg text-center border border-gray-200">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Skaner Kalorii</h1>
        <p className="text-gray-600 mb-6">
          Wgraj zdjęcie, aby zeskanować jedzenie i sprawdzić jego kaloryczność.
        </p>

        <div className="flex flex-col items-center justify-center mb-6">
          <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300 shadow-md hover:shadow-lg">
            Wybierz zdjęcie jedzenia
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {imageUrl && (
          <div className="mb-6 border-2 border-gray-200 rounded-xl overflow-hidden shadow-inner">
            <img src={imageUrl} alt="Podgląd jedzenia" className="max-h-80 w-full object-cover" />
          </div>
        )}

        <button
          onClick={analyzeImage}
          disabled={loading || !imageFile}
          className={`w-full py-4 px-6 rounded-full font-bold text-lg transition-all duration-300 ${
            loading || !imageFile
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? 'Analizuję...' : 'Skanuj jedzenie'}
        </button>

        {error && (
          <p className="mt-6 text-red-500 font-medium">{error}</p>
        )}

        {resultType === 'analysis' && (
          <div className="mt-4 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={generateRecipe}
              disabled={loading}
              className={`py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? 'Generuję...' : 'Generuj Przepis ✨'}
            </button>
            <button
              onClick={suggestAlternative}
              disabled={loading}
              className={`py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? 'Proponuję...' : '✨ Zdrowsza Alternatywa'}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-8 text-left bg-gray-100 p-6 rounded-xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              {resultType === 'analysis' && 'Wynik analizy:'}
              {resultType === 'recipe' && 'Wygenerowany przepis:'}
              {resultType === 'alternative' && 'Zdrowsza alternatywa:'}
            </h2>
            <p className="whitespace-pre-wrap text-gray-800">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
