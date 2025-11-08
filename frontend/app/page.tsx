'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, FileText, Database, Sparkles, Brain, ScanText, Zap, Shield, ChevronRight } from 'lucide-react'
import { DocumentUploader } from '@/components/upload/DocumentUploader'
import { DocumentList } from '@/components/document/DocumentList'
import { NotionTable } from '@/components/rag/NotionTable'
import { RAGChat } from '@/components/rag/RAGChat'

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-amber-50 dark:bg-amber-950 min-h-screen" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.03) 10px, rgba(0,0,0,.03) 20px)' }}>
        
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-amber-100/95 dark:bg-amber-900/95 backdrop-blur-sm z-50 border-b-4 border-amber-800 dark:border-amber-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-amber-900 dark:text-amber-100" />
                  <h1 className="text-3xl font-black text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em', textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
                    Absola
                  </h1>
                </div>
                <div className="hidden md:flex space-x-6">
                  <a href="#home" className="text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-200 transition font-semibold" style={{ fontFamily: 'Georgia, serif' }}>Home</a>
                  <a href="#features" className="text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-200 transition font-semibold" style={{ fontFamily: 'Georgia, serif' }}>Features</a>
                  <a href="#how-it-works" className="text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-200 transition font-semibold" style={{ fontFamily: 'Georgia, serif' }}>How It Works</a>
                  <a href="#about" className="text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-200 transition font-semibold" style={{ fontFamily: 'Georgia, serif' }}>About</a>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 transition border-2 border-amber-800 dark:border-amber-600"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-900" /> : <Moon className="w-5 h-5 text-amber-900" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="home" className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-black mb-6 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.02em', textShadow: '3px 3px 0px rgba(0,0,0,0.2)' }}>
              Absola.
            </h1>
            <p className="text-xl md:text-2xl text-amber-800 dark:text-amber-200 mb-8 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
              Privacy-first legal document analysis powered by AI.
            </p>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
              <div className="bg-amber-100 dark:bg-amber-900 rounded-none p-6 shadow-lg border-4 border-amber-800 dark:border-amber-700" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
                <Shield className="w-12 h-12 mx-auto mb-2 text-amber-900 dark:text-amber-100" />
                <p className="text-4xl font-black text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>100%</p>
                <p className="text-amber-800 dark:text-amber-200 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>Private</p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900 rounded-none p-6 shadow-lg border-4 border-amber-800 dark:border-amber-700" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
                <Brain className="w-12 h-12 mx-auto mb-2 text-amber-900 dark:text-amber-100" />
                <p className="text-4xl font-black text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>AI</p>
                <p className="text-amber-800 dark:text-amber-200 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>Powered</p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900 rounded-none p-6 shadow-lg border-4 border-amber-800 dark:border-amber-700" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
                <Zap className="w-12 h-12 mx-auto mb-2 text-amber-900 dark:text-amber-100" />
                <p className="text-4xl font-black text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>Fast</p>
                <p className="text-amber-800 dark:text-amber-200 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>Analysis</p>
              </div>
            </div>

            <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-800 dark:bg-amber-700 text-amber-50 font-bold text-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition border-4 border-amber-900 dark:border-amber-800 shadow-lg" style={{ fontFamily: 'Georgia, serif', boxShadow: '6px 6px 0px rgba(0,0,0,0.3)' }}>
              Get Started <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-amber-100 dark:bg-amber-900 border-y-4 border-amber-800 dark:border-amber-700">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-black text-center mb-12 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif', textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
              Features
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-amber-50 dark:bg-amber-950 p-8 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg hover:transform hover:scale-105 transition" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
                <ScanText className="w-16 h-16 mb-4 text-amber-900 dark:text-amber-100" />
                <h3 className="text-2xl font-black mb-4 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>
                  OCR Extraction
                </h3>
                <p className="text-amber-800 dark:text-amber-200 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                  Extract text from images and scanned documents with advanced Optical Character Recognition technology.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 p-8 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg hover:transform hover:scale-105 transition" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
                <Brain className="w-16 h-16 mb-4 text-amber-900 dark:text-amber-100" />
                <h3 className="text-2xl font-black mb-4 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>
                  AI-Powered RAG
                </h3>
                <p className="text-amber-800 dark:text-amber-200 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                  Advanced Retrieval-Augmented Generation using Gemini API for accurate legal document analysis.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 p-8 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg hover:transform hover:scale-105 transition" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
                <Database className="w-16 h-16 mb-4 text-amber-900 dark:text-amber-100" />
                <h3 className="text-2xl font-black mb-4 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>
                  Structured Knowledge
                </h3>
                <p className="text-amber-800 dark:text-amber-200 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                  Organize insights in Notion-style tables for easy reference and collaboration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-amber-100 dark:bg-amber-900">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-black text-center mb-12 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif', textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="relative">
                <div className="bg-amber-50 dark:bg-amber-950 p-6 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg hover:transform hover:-translate-y-2 transition-all duration-300" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
                  <div className="w-12 h-12 bg-amber-800 dark:bg-amber-700 text-amber-50 rounded-full flex items-center justify-center font-black text-xl mb-4" style={{ fontFamily: 'Georgia, serif' }}>1</div>
                  <h3 className="text-xl font-black mb-3 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>
                    Upload Documents
                  </h3>
                  <p className="text-amber-800 dark:text-amber-200 font-semibold text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    Upload PDFs, images, or scanned documents. Our OCR technology extracts text from any format.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-amber-50 dark:bg-amber-950 p-6 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg hover:transform hover:-translate-y-2 transition-all duration-300" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
                  <div className="w-12 h-12 bg-amber-800 dark:bg-amber-700 text-amber-50 rounded-full flex items-center justify-center font-black text-xl mb-4" style={{ fontFamily: 'Georgia, serif' }}>2</div>
                  <h3 className="text-xl font-black mb-3 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>
                    AI Processing
                  </h3>
                  <p className="text-amber-800 dark:text-amber-200 font-semibold text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    Gemini AI analyzes and chunks your documents, creating semantic embeddings for intelligent retrieval.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-amber-50 dark:bg-amber-950 p-6 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg hover:transform hover:-translate-y-2 transition-all duration-300" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
                  <div className="w-12 h-12 bg-amber-800 dark:bg-amber-700 text-amber-50 rounded-full flex items-center justify-center font-black text-xl mb-4" style={{ fontFamily: 'Georgia, serif' }}>3</div>
                  <h3 className="text-xl font-black mb-3 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>
                    Query & Retrieve
                  </h3>
                  <p className="text-amber-800 dark:text-amber-200 font-semibold text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    Ask questions in natural language. RAG retrieves relevant context and generates accurate answers.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-amber-50 dark:bg-amber-950 p-6 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg hover:transform hover:-translate-y-2 transition-all duration-300" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
                  <div className="w-12 h-12 bg-amber-800 dark:bg-amber-700 text-amber-50 rounded-full flex items-center justify-center font-black text-xl mb-4" style={{ fontFamily: 'Georgia, serif' }}>4</div>
                  <h3 className="text-xl font-black mb-3 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>
                    Organize Knowledge
                  </h3>
                  <p className="text-amber-800 dark:text-amber-200 font-semibold text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    Store insights in structured tables for easy access, collaboration, and future reference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Document Management & Chat Interface */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-black mb-8 text-amber-900 dark:text-amber-100 text-center" style={{ fontFamily: 'Georgia, serif' }}>Document Management:</h2>
            
            {/* Two Column Layout: Upload/List + Chat */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* Left Column: Document Upload and List */}
              <div className="lg:col-span-1">
                <div className="bg-amber-50 dark:bg-amber-950 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg p-6" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)', minHeight: '500px' }}>
                  <DocumentUploader />
                  <div className="mt-6">
                    <DocumentList onDocumentSelect={setSelectedDocumentId} />
                  </div>
                </div>
              </div>

              {/* Right Column: Chat Interface - Always Visible */}
              <div className="lg:col-span-2">
                <RAGChat documentId={selectedDocumentId} />
              </div>
            </div>

            {/* Show/Hide Knowledge Table Button */}
            <div className="text-center mb-8">
              <button
                onClick={() => setShowTable(!showTable)}
                className="px-8 py-4 bg-amber-800 dark:bg-amber-700 text-amber-50 font-bold text-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition border-4 border-amber-900 dark:border-amber-800 shadow-lg"
                style={{ fontFamily: 'Georgia, serif', boxShadow: '6px 6px 0px rgba(0,0,0,0.3)' }}
              >
                {showTable ? 'Hide Knowledge Table' : 'Show Knowledge Table'}
              </button>
            </div>

            {/* Knowledge Table */}
            {showTable && (
              <div className="mt-8">
                <h3 className="text-3xl font-black mb-4 text-amber-900 dark:text-amber-100 text-center" style={{ fontFamily: 'Georgia, serif' }}>Knowledge Base:</h3>
                <NotionTable />
              </div>
            )}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-4 bg-amber-100 dark:bg-amber-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-black mb-8 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif', textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
              About
            </h2>
            
            <div className="bg-amber-50 dark:bg-amber-950 p-10 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
              <p className="text-xl text-amber-800 dark:text-amber-200 font-semibold mb-8 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                Absola is a privacy-first legal document analysis platform designed for the Indian legal system,
                combining advanced AI capabilities with respect for data sovereignty.
              </p>
              
              <div className="border-t-2 border-amber-800 dark:border-amber-700 pt-8 mt-8">
                <h3 className="text-2xl font-black mb-4 text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>
                  Creator
                </h3>
                <p className="text-lg text-amber-800 dark:text-amber-200 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  Mridankan Mandal
                </p>
                <div className="flex items-center justify-center gap-3">
                  <img src="/logo.png" alt="Azure Division" className="w-10 h-10" />
                  <p className="text-4xl font-black georgia-font azure-blue">
                    AZURE DIVISION
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t-2 border-amber-800 dark:border-amber-700">
                <p className="text-amber-800 dark:text-amber-200 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                  Built with advanced RAG technology, specialized for Indian statutes, case law, and legal precedents.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 bg-amber-100 dark:bg-amber-900 border-t-4 border-amber-800 dark:border-amber-700">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="/logo.png" alt="Azure Division" className="w-6 h-6" />
              <p className="text-xl font-black georgia-font azure-blue">
                AZURE DIVISION
              </p>
            </div>
            <p className="text-amber-800 dark:text-amber-200 text-sm georgia-font">
              © 2025 Absola - Created by Mridankan Mandal
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
