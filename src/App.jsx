import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { translations } from './translations';
import { Globe, MapPin } from 'lucide-react';

function App() {
  const [lang, setLang] = useState('en');
  const [signatureCount, setSignatureCount] = useState(0);
  const [supporters, setSupporters] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    reason: '',
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const t = translations[lang];

  useEffect(() => {
    fetchSignatureCount();
    fetchSupporters();

    // Set up realtime subscription
    const subscription = supabase
      .channel('public:signatures')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'signatures' }, payload => {
        setSignatureCount(prev => prev + 1);
        fetchSupporters();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchSignatureCount = async () => {
    const { count, error } = await supabase
      .from('signatures')
      .select('*', { count: 'exact', head: true });
    
    if (!error && count !== null) {
      setSignatureCount(count);
    }
  };

  const fetchSupporters = async () => {
    const { data, error } = await supabase
      .from('signatures')
      .select('id, created_at, full_name, country, reason')
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (!error && data) {
      setSupporters(data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    const { error } = await supabase
      .from('signatures')
      .insert([
        {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          reason: formData.reason,
          consent: formData.consent
        }
      ]);
      
    setIsSubmitting(false);
    
    if (error) {
      console.error(error);
      setSubmitStatus('error');
    } else {
      setSubmitStatus('success');
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        country: '',
        reason: '',
        consent: false
      });
      // The realtime subscription will update the count and list,
      // but we can manually trigger it too just in case.
      fetchSignatureCount();
      fetchSupporters();
    }
  };

  const scrollToForm = () => {
    document.getElementById('petition-form').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="lang-selector">
            {Object.keys(translations).map(code => (
              <button
                key={code}
                className={`lang-btn ${lang === code ? 'active' : ''}`}
                onClick={() => setLang(code)}
              >
                {translations[code].languageName}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="counter-wrapper">
            <div className="signature-count">
              {signatureCount.toLocaleString()}
            </div>
            <div className="signature-text">
              {t.signatureCount}
            </div>
          </div>
          <h1 className="hero-title">{t.heroTitle}</h1>
          <p className="hero-subtitle">{t.heroSubtitle}</p>
          <button className="cta-button" onClick={scrollToForm}>
            {t.ctaSign}
          </button>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section">
        <div className="container">
          {t.content.map((paragraph, index) => (
            <p key={index} className="content-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <section className="form-section" id="petition-form">
        <div className="container">
          <div className="petition-form">
            <h2 className="form-title">{t.formTitle}</h2>
            
            {submitStatus === 'success' && (
              <div className="status-msg status-success">
                {t.formSuccess}
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="status-msg status-error">
                {t.formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t.formFullName} *</label>
                  <input
                    type="text"
                    name="full_name"
                    className="form-input"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.formEmail} *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t.formPhone}</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.formCountry}</label>
                  <input
                    type="text"
                    name="country"
                    className="form-input"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t.formReason} *</label>
                <textarea
                  name="reason"
                  className="form-textarea"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="consent">{t.formConsent}</label>
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting || !formData.consent}
              >
                {isSubmitting ? t.formSubmitting : t.formSubmit}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Supporters Section */}
      {supporters.length > 0 && (
        <section className="supporters-section">
          <div className="container">
            <h2 className="supporters-title">{t.supportersTitle}</h2>
            <div className="supporters-grid">
              {supporters.map((supporter) => (
                <div key={supporter.id} className="supporter-card">
                  <h3 className="supporter-name">{supporter.full_name}</h3>
                  {supporter.country && (
                    <div className="supporter-country">
                      <MapPin size={16} />
                      {supporter.country}
                    </div>
                  )}
                  <p className="supporter-reason">"{supporter.reason.substring(0, 150)}{supporter.reason.length > 150 ? '...' : ''}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
