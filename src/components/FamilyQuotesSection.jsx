function FamilyQuotesSection({ text, images }) {
  return (
    <section className="section family-section">
      <div className="family-gallery reveal">
        {images.map((image, index) => (
          <div className="family-photo" key={image}>
            <img src={image} alt={`${text.family.imageAlt} ${index + 1}`} />
          </div>
        ))}
      </div>

      <div className="family-content">
        <div className="section-heading compact reveal">
          <p className="eyebrow">{text.family.eyebrow}</p>
          <h2>{text.family.title}</h2>
          <p>{text.family.body}</p>
        </div>

        <div className="quote-list">
          {text.family.quotes.map((quote) => (
            <figure className="quote-card reveal" key={`${quote.author}-${quote.text}`}>
              <blockquote>{quote.text}</blockquote>
              <figcaption>
                <strong>{quote.author}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FamilyQuotesSection
