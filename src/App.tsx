import { useState } from 'react';
import axios from 'axios';
import './App.css'; // Importa seu CSS estilizado

// Tipagem para a resposta da API
interface AnalysisResult {
  categoria: string;
  justificativa: string;
  resposta_sugerida: string;
  reply?: string;
  reason?: string;
}

function App() {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    // Validação simples
    if (!inputText && !file) {
      alert("Por favor, digite um texto ou envie um arquivo.");
      return;
    }
    
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    // Prioriza o arquivo se tiver, senão vai o texto
    if (file) {
      formData.append('file', file);
    } else {
      formData.append('text_input', inputText);
    }

    try {
      // Conecta no seu Python (Porta 8000)
      const response = await axios.post('http://localhost:8000/analyze', formData);
      
      // Tratamento para garantir que o JSON venha correto
      let data = response.data.result;
      
      // Se vier como string (texto), transforma em objeto
      if (typeof data === 'string') {
        try {
           const cleanJson = data.replace(/```json/g, "").replace(/```/g, "");
           data = JSON.parse(cleanJson);
        } catch (e) {
           console.error("Erro ao converter JSON:", e);
        }
      }
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor. Verifique se o Python (backend) está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        
        <header className="header">
          <h1>📨 AutoU Email Triager</h1>
          <p>Classificação Inteligente & Resposta Automática</p>
        </header>

        <div className="content">
          
          {/* Área de Inputs */}
          <div className="input-group">
            
            <div className="file-input-wrapper">
              <label htmlFor="file-upload" className="custom-file-upload">
                {file ? (
                   <span style={{color: '#0047AB', fontWeight: 'bold'}}>📎 {file.name}</span>
                ) : (
                   <span>📂 Clique para carregar PDF ou TXT</span>
                )}
              </label>
              <input 
                id="file-upload" 
                type="file" 
                accept=".txt,.pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="divider">ou digite o conteúdo abaixo</div>

            <textarea
              className="text-area"
              placeholder="Cole o corpo do email aqui para análise..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!!file}
            />
          </div>

          <button onClick={handleAnalyze} disabled={loading} className="btn-primary">
            {loading ? "Processando..." : "Classificar Email"}
          </button>

          {/* Resultado da IA */}
          {result && (
            <div className={`result-box ${result.categoria?.toLowerCase().includes('produt') ? 'produtivo' : 'improdutivo'}`}>
              <div className="result-header">
                <strong>Categoria:</strong>
                <span className="badge">{result.categoria}</span>
              </div>

              <div className="response-area">
                <p className="label-response">Resposta Sugerida:</p>
                <p className="response-text">"{result.resposta_sugerida || result.reply}"</p>
              </div>
              
              <div className="reason-area">
                <small>Motivo: {result.justificativa || result.reason}</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;