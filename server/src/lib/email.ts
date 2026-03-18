type EmailSection = {
    label: string
    value: string
}

type EmailCta = {
    label: string
    url: string
}

type PremiumEmailOptions = {
    preheader?: string
    eyebrow?: string
    title: string
    intro: string
    sections?: EmailSection[]
    cta?: EmailCta
    secondaryCta?: EmailCta
    footer: string
}

const FALLBACK_FRONTEND_URL = 'http://localhost:5173'

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function formatHtmlText(value: string) {
    return escapeHtml(value)
        .replace(/\n/g, '<br />')
}

export function getFrontendUrl(path = '') {
    const baseUrl = (process.env.FRONTEND_URL || process.env.PUBLIC_URL || FALLBACK_FRONTEND_URL).replace(/\/+$/, '')
    if (!path) return baseUrl
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export function renderPremiumEmail({
    preheader,
    eyebrow = 'Jence',
    title,
    intro,
    sections = [],
    cta,
    secondaryCta,
    footer,
}: PremiumEmailOptions) {
    const safeTitle = escapeHtml(title)
    const safePreheader = escapeHtml(preheader || intro)
    const safeEyebrow = escapeHtml(eyebrow)
    const safeIntro = formatHtmlText(intro)
    const safeFooter = formatHtmlText(footer)

    const sectionsHtml = sections.length > 0
        ? `
            <div style="margin: 28px 0 0;">
              ${sections.map((section) => `
                <div style="margin-top: 12px; padding: 16px 18px; border: 1px solid #e8decb; border-radius: 18px; background: #fffdfa;">
                  <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #9e8454; margin-bottom: 8px; font-weight: 700;">${escapeHtml(section.label)}</div>
                  <div style="font-size: 15px; line-height: 1.65; color: #2a2317;">${formatHtmlText(section.value)}</div>
                </div>
              `).join('')}
            </div>
        `
        : ''

    const ctaHtml = cta
        ? `
            <div style="margin-top: 28px;">
              <a href="${escapeHtml(cta.url)}" style="display: inline-block; padding: 14px 22px; border-radius: 999px; background: linear-gradient(135deg, #d4af37 0%, #b88416 100%); color: #fffdf8; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 14px 30px rgba(184, 132, 22, 0.22);">
                ${escapeHtml(cta.label)}
              </a>
            </div>
        `
        : ''

    const secondaryCtaHtml = secondaryCta
        ? `
            <div style="margin-top: 14px;">
              <a href="${escapeHtml(secondaryCta.url)}" style="display: inline-block; color: #8d6b22; text-decoration: none; font-size: 13px; font-weight: 600;">
                ${escapeHtml(secondaryCta.label)}
              </a>
            </div>
        `
        : ''

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f4efe5; color: #241d12;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">
      ${safePreheader}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%; background: radial-gradient(circle at top, #fbf6ea 0%, #f4efe5 52%, #efe7d8 100%);">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%; max-width: 640px;">
            <tr>
              <td style="padding-bottom: 18px; text-align: center;">
                <div style="display: inline-flex; align-items: center; gap: 10px; padding: 9px 14px; border-radius: 999px; border: 1px solid rgba(160, 121, 36, 0.18); background: rgba(255, 251, 242, 0.96); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8d6b22; font-weight: 800;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 999px; background: linear-gradient(135deg, #d4af37 0%, #c07d0f 100%);"></span>
                  ${safeEyebrow}
                </div>
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid #e7ddc7; border-radius: 30px; background: linear-gradient(180deg, #fffdf8 0%, #fffaf1 100%); box-shadow: 0 30px 70px rgba(94, 72, 24, 0.10); overflow: hidden;">
                <div style="height: 8px; background: linear-gradient(90deg, #f2d680 0%, #d4af37 55%, #b88416 100%);"></div>
                <div style="padding: 36px 32px 30px;">
                  <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 34px; line-height: 1.12; font-weight: 700; letter-spacing: -0.03em; color: #1f1a12;">
                    ${safeTitle}
                  </div>
                  <p style="margin: 18px 0 0; font-size: 16px; line-height: 1.75; color: #4b4030;">
                    ${safeIntro}
                  </p>
                  ${sectionsHtml}
                  ${ctaHtml}
                  ${secondaryCtaHtml}
                </div>
                <div style="padding: 0 32px 28px;">
                  <div style="padding-top: 18px; border-top: 1px solid #ece3d0; font-size: 12px; line-height: 1.7; color: #786a54;">
                    ${safeFooter}
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function renderPlainTextEmail({
    title,
    intro,
    sections = [],
    cta,
    secondaryCta,
    footer,
}: PremiumEmailOptions) {
    const lines = [
        title,
        '',
        intro,
    ]

    for (const section of sections) {
        lines.push('', `${section.label}:`, section.value)
    }

    if (cta) {
        lines.push('', `${cta.label}: ${cta.url}`)
    }

    if (secondaryCta) {
        lines.push('', `${secondaryCta.label}: ${secondaryCta.url}`)
    }

    lines.push('', footer)

    return lines.join('\n')
}
