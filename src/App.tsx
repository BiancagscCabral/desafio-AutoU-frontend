import { useState } from 'react';
import axios from 'axios';
import './App.css'; 


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
    if (!inputText && !file) {
      alert("Por favor, digite um texto ou envie um arquivo.");
      return;
    }
    
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else {
      formData.append('text_input', inputText);
    }

    try {
      // Lembre-se de usar a URL do Render aqui quando for pro ar!
      const response = await axios.post('http://localhost:8000/analyze', formData);
      
      let data = response.data.result;
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
      alert("Erro de conexão com o Backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      
      {/* 1. Sidebar (Menu Lateral) */}
      <aside className="sidebar">
        <div className="brand">
  <img src="/assets/autou_logo.jpg" alt="AutoU Logo" className="logo" />
  <h2>Auto<span>U</span> Triager</h2>
</div>
        
        <nav className="menu">
          <a href="#" className="menu-item active">Nova Análise</a>
          <a href="#" className="menu-item">Histórico</a>
          <a href="#" className="menu-item">Configurações</a>
        </nav>

        <div className="user-profile">
          <div className="avatar">U</div>
          <div className="user-info">
            <span className="name">Usuário AutoU</span>
            <span className="role">Analista</span>
          </div>
        </div>
      </aside>

      {/* 2. Conteúdo Principal */}
      <main className="main-content">
        <header className="top-bar">
          <h1>Triagem Inteligente de Emails</h1>
          <span className="date">{new Date().toLocaleDateString('pt-BR')}</span>
        </header>

        <div className="workspace-grid">
          
          {/* Coluna da Esquerda: INPUTS */}
          <div className="panel input-panel">
            <h3>📥 Entrada de Dados</h3>
            <p className="subtitle">Carregue um arquivo ou cole o texto para processar.</p>
            
            <div className="input-group">
              <label htmlFor="file-upload" className={`drop-zone ${file ? 'has-file' : ''}`}>
                <div className="icon-large">{file ? '📄' : '☁️'}</div>
                <div className="drop-text">
                  {file ? (
                    <strong>{file.name}</strong>
                  ) : (
                    <>Arraste seu PDF/TXT ou <span>clique para buscar</span></>
                  )}
                </div>
              </label>
              <input 
                id="file-upload" 
                type="file" 
                accept=".txt,.pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <div className="divider"><span>OU TEXTO DIRETO</span></div>

              <textarea
                className="text-area-modern"
                placeholder="Ex: Prezado time, gostaria de solicitar o reembolso..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!!file}
              />

              <div className="actions">
                <button onClick={handleAnalyze} disabled={loading} className="btn-analyze">
                  {loading ? "Processando IA..." : "Analisar Email Agora"}
                </button>
                {(file || inputText) && (
                  <button onClick={() => {setFile(null); setInputText(''); setResult(null)}} className="btn-clear">
                    Limpar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Coluna da Direita: RESULTADOS */}
          <div className="panel result-panel">
            <h3>🤖 Resultado da Análise</h3>
            
            {!result && !loading && (
              <div className="empty-state">
                <span className="empty-icon">waiting_for_data</span>
                <p>Aguardando envio para classificação...</p>
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Consultando Inteligência Artificial...</p>
              </div>
            )}

            {result && (
              <div className={`result-content fade-in ${result.categoria?.toLowerCase().includes('produt') ? 'theme-success' : 'theme-warning'}`}>
                
                <div className="status-badge">
                  <span className="status-label">Classificação Detectada</span>
                  <span className="status-value">{result.categoria}</span>
                </div>

                <div className="info-block">
                  <h4>💡 Resposta Sugerida</h4>
                  <div className="response-box">
                    "{result.resposta_sugerida || result.reply}"
                  </div>
                </div>

                <div className="info-block">
                  <h4>🔍 Justificativa da IA</h4>
                  <p className="reason-text">{result.justificativa || result.reason}</p>
                </div>

              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;