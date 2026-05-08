function VietDonSection({ text, banner, logo }) {
  return (
    <section className="section project-section" id="vietdon">
      <div className="section-heading reveal">
        <p className="eyebrow">{text.vietdon.eyebrow}</p>
        <h2>{text.vietdon.title}</h2>
        <p>{text.vietdon.body}</p>
      </div>

      <div className="vietdon-showcase">
        <div className="vietdon-media reveal">
          <img src={banner} alt={text.vietdon.bannerAlt} />
        </div>

        <div className="flow-board reveal" aria-label={text.meta.productFlow}>
          <img className="round-logo" src={logo} alt={text.vietdon.logoAlt} />
          {text.vietdon.flow.map((step) => (
            <div className="flow-step reveal" key={step.number}>
              <span>{step.number}</span>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default VietDonSection
