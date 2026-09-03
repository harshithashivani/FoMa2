import { useState } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { supportArticles } from '../data';

type Props = {
  onClose: () => void;
};

export function SupportModal({ onClose }: Props) {
  const [search, setSearch] = useState('');
  const [openArticle, setOpenArticle] = useState<number | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const filtered = supportArticles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal support-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div><h2>Support Center</h2><p>Find answers, browse help articles, or contact our team.</p></div>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {openArticle === null && !contactOpen && (
          <>
            <label className="search-box support-search"><Search size={14} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search help articles..." autoFocus /></label>
            <div className="support-article-list">
              {filtered.map((article) => (
                <button key={article.id} className="support-article-row" onClick={() => setOpenArticle(article.id)}>
                  <div><strong>{article.title}</strong><span className="support-category">{article.category}</span></div>
                  <ChevronRight size={18} />
                </button>
              ))}
              {filtered.length === 0 && <div className="empty-state">No articles match your search.</div>}
            </div>
            <button className="secondary-button support-contact-btn" onClick={() => setContactOpen(true)}>Contact Support Team</button>
          </>
        )}

        {openArticle !== null && (
          <div className="support-article-detail">
            <button className="back-btn" onClick={() => setOpenArticle(null)}>Back to articles</button>
            <h3>{supportArticles[openArticle].title}</h3>
            <span className="support-category">{supportArticles[openArticle].category}</span>
            <p>{supportArticles[openArticle].content}</p>
          </div>
        )}

        {contactOpen && (
          <div className="support-article-detail">
            <button className="back-btn" onClick={() => setContactOpen(false)}>Back to articles</button>
            <h3>Contact Support</h3>
            <div className="contact-info">
              <div className="contact-item"><strong>Phone</strong><span>+1 (800) 555-0142</span><span>Mon–Fri, 6am–10pm EST</span></div>
              <div className="contact-item"><strong>Email</strong><span>support@foma-industrial.com</span><span>Response within 4 hours</span></div>
              <div className="contact-item"><strong>On-site</strong><span>Facility 01, Maintenance Office</span><span>Available during operating hours</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
