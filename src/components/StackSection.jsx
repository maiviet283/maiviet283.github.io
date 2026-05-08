function StackSection({ text }) {
  return (
    <section className="section split-section" id="stack">
      <div className="section-heading compact reveal">
        <p className="eyebrow">{text.stack.eyebrow}</p>
        <h2>{text.stack.title}</h2>
      </div>

      <div className="stack-cloud reveal" aria-label={text.meta.technologyStack}>
        {text.stack.items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className="belief-panel reveal">
        <h3>{text.stack.beliefTitle}</h3>
        <p>{text.stack.beliefBody}</p>
      </div>
    </section>
  )
}

export default StackSection
