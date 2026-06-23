import { PrintElementOptions } from '../types';

export const escapeHtml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const sanitizeUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  return '';
};

export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const applyStyles = (el: HTMLElement, styles: Record<string, string>) => {
  Object.assign(el.style, styles);
};

export const buildPrintElement = (opts: PrintElementOptions): HTMLElement => {
  const { fontFamily, fontSize, isEn, subject, letterContent, branding, signatureImage, sealImage } = opts;
  const dir = isEn ? 'ltr' : 'rtl';
  const align = isEn ? 'left' : 'right';

  // Root wrapper
  const wrapper = document.createElement('div');
  applyStyles(wrapper, {
    fontFamily: `'${fontFamily}', sans-serif`,
    padding: '40px',
    textAlign: align,
    direction: dir,
    lineHeight: '1.8',
    color: '#000',
    fontSize: `${fontSize}px`,
    minHeight: '297mm',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
  });

  const bodySection = document.createElement('div');

  // ── Header ──
  if (branding.enableHeader) {
    const header = document.createElement('div');
    applyStyles(header, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid #a18072',
      paddingBottom: '15px',
      marginBottom: '30px',
      direction: dir,
    });

    const headerText = document.createElement('div');
    applyStyles(headerText, { textAlign: align });

    const companyNameEl = document.createElement('h1');
    applyStyles(companyNameEl, { fontSize: '20px', margin: '0', color: '#43302b', fontFamily: `'${fontFamily}', sans-serif` });
    companyNameEl.textContent = branding.companyName || 'المؤسسة';

    const companyDetailsEl = document.createElement('p');
    applyStyles(companyDetailsEl, { fontSize: '12px', color: '#777', margin: '5px 0 0 0', whiteSpace: 'pre-line', fontFamily: `'${fontFamily}', sans-serif` });
    companyDetailsEl.textContent = branding.companyDetails || '';

    headerText.appendChild(companyNameEl);
    headerText.appendChild(companyDetailsEl);
    header.appendChild(headerText);

    if (branding.logoUrl) {
      const logoSrc = sanitizeUrl(branding.logoUrl);
      if (logoSrc) {
        const logo = document.createElement('img');
        logo.src = logoSrc;
        applyStyles(logo, { maxHeight: '60px', maxWidth: '150px', objectFit: 'contain' });
        header.appendChild(logo);
      }
    }

    bodySection.appendChild(header);
  }

  // ── Subject title ──
  const titleEl = document.createElement('h2');
  applyStyles(titleEl, { textAlign: 'center', marginBottom: '30px', fontFamily: `'${fontFamily}', sans-serif` });
  titleEl.textContent = subject || 'خطاب';
  bodySection.appendChild(titleEl);

  // ── Letter body ──
  const contentEl = document.createElement('div');
  applyStyles(contentEl, { whiteSpace: 'pre-wrap', fontFamily: `'${fontFamily}', sans-serif` });
  contentEl.textContent = letterContent;
  bodySection.appendChild(contentEl);

  // ── Signature & seal ──
  if (signatureImage || sealImage) {
    const sigSection = document.createElement('div');
    applyStyles(sigSection, { marginTop: '50px', display: 'flex', justifyContent: 'flex-end', gap: '40px', alignItems: 'center', paddingLeft: '20px', direction: dir });

    const sigInner = document.createElement('div');
    applyStyles(sigInner, { textAlign: 'center' });

    const sigLabel = document.createElement('p');
    applyStyles(sigLabel, { fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', color: '#43302b', fontFamily: `'${fontFamily}', sans-serif` });
    sigLabel.textContent = 'التوقيع والختم:';
    sigInner.appendChild(sigLabel);

    const imgRow = document.createElement('div');
    applyStyles(imgRow, { display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', height: '80px' });

    if (signatureImage) {
      const sigSrc = sanitizeUrl(signatureImage);
      if (sigSrc) {
        const sigImg = document.createElement('img');
        sigImg.src = sigSrc;
        applyStyles(sigImg, { maxHeight: '70px', maxWidth: '120px', objectFit: 'contain' });
        imgRow.appendChild(sigImg);
      }
    }
    if (sealImage) {
      const sealSrc = sanitizeUrl(sealImage);
      if (sealSrc) {
        const sealImg = document.createElement('img');
        sealImg.src = sealSrc;
        applyStyles(sealImg, { maxHeight: '70px', maxWidth: '100px', objectFit: 'contain' });
        imgRow.appendChild(sealImg);
      }
    }

    sigInner.appendChild(imgRow);
    sigSection.appendChild(sigInner);
    bodySection.appendChild(sigSection);
  }

  wrapper.appendChild(bodySection);

  // ── Footer ──
  if (branding.enableFooter) {
    const footer = document.createElement('div');
    applyStyles(footer, {
      borderTop: '1px solid #eaddd7',
      paddingTop: '10px',
      textAlign: 'center',
      fontSize: '11px',
      color: '#846358',
      marginTop: '40px',
      fontFamily: `'${fontFamily}', sans-serif`,
    });
    footer.textContent = branding.footerText || '';
    wrapper.appendChild(footer);
  }

  return wrapper;
};
