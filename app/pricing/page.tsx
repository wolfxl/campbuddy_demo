import CallToAction from '@/components/CallToAction';
import styles from './page.module.css';

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals and small teams just getting started.',
      features: [
        'Up to 3 users',
        'Basic project management',
        'Limited file storage (5GB)',
        'Email support',
        'Mobile app access',
      ],
      cta: 'Get Started',
      ctaLink: '/signup',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$12',
      period: 'per user/month',
      description: 'Ideal for growing teams that need more features and capacity.',
      features: [
        'Unlimited users',
        'Advanced project management',
        'Expanded storage (50GB)',
        'Priority support',
        'Advanced analytics',
        'Custom workflows',
        'API access',
      ],
      cta: 'Try Free for 14 Days',
      ctaLink: '/signup',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'tailored to your needs',
      description: 'For organizations requiring advanced security and control.',
      features: [
        'Everything in Pro',
        'Unlimited storage',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security',
        'SSO authentication',
        'Compliance certifications',
      ],
      cta: 'Contact Sales',
      ctaLink: '/contact',
      highlighted: false,
    },
  ];

  return (
    <div className={styles.pricingPage}>
      <section className={styles.pricingHero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Pricing Plans</h1>
            <p className={styles.heroDescription}>
              Choose the plan that works best for your team. All plans include a 14-day free trial with no credit card required.
            </p>
          </div>
        </div>
      </section>
      
      <section className={styles.pricingPlans}>
        <div className="container">
          <div className={styles.plansGrid}>
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`${styles.planCard} ${plan.highlighted ? styles.highlightedPlan : ''}`}
              >
                <div className={styles.planHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPricing}>
                    <span className={styles.planPrice}>{plan.price}</span>
                    <span className={styles.planPeriod}>{plan.period}</span>
                  </div>
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>
                <div className={styles.planFeatures}>
                  <ul className={styles.featuresList}>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className={styles.featureItem}>
                        <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.planFooter}>
                  <a href={plan.ctaLink} className={`${styles.planCta} ${plan.highlighted ? styles.ctaHighlighted : ''}`}>
                    {plan.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className={styles.faqSection}>
        <div className="container">
          <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Can I change my plan later?</h3>
              <p className={styles.faqAnswer}>
                Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes to your plan will be reflected in your next billing cycle.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How does the 14-day trial work?</h3>
              <p className={styles.faqAnswer}>
                Your trial begins as soon as you create your account. You'll have full access to all features for 14 days, with no credit card required.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What payment methods do you accept?</h3>
              <p className={styles.faqAnswer}>
                We accept all major credit cards, PayPal, and for Enterprise plans, we can arrange invoicing.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Is there a discount for annual billing?</h3>
              <p className={styles.faqAnswer}>
                Yes, we offer a 20% discount when you choose annual billing on any of our paid plans.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <CallToAction />
    </div>
  );
}