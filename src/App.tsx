/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Loader2, Copy, Check, PenLine, Building2, User, MessageSquare, Send, Save, Archive, X, Clock, Briefcase, AlertCircle, Heart, Calendar, Download, SpellCheck, Search, Filter, Undo as UndoIcon, Redo as RedoIcon, Mail, Sparkles, Library, Plus, Bookmark, Sun, Moon, Wifi, WifiOff, Camera, Upload, Mic, MicOff, Pin, PinOff, Star } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { useAuth } from './contexts/AuthContext';
import { syncUserDataToCloud, listenToCloudData } from './lib/sync';

interface SavedLetter {
  id: string;
  subject: string;
  date: string;
  content: string;
  type?: string;
  isDraft?: boolean;
  formData?: any;
  isPinned?: boolean;
  tags?: string[];
  savedAt?: number;
}

const letterTypes = {
  'إداري/رسمي': {
    icon: Building2,
    subTypes: [
      { name: 'خطاب طلب (وظيفة، إجازة، مساعدة)', icon: Briefcase },
      { name: 'خطاب شكوى (تظلم، إبلاغ عن مشكلة)', icon: AlertCircle },
      { name: 'خطاب استفسار', icon: MessageSquare },
      { name: 'أخرى', icon: FileText }
    ]
  },
  'أعمال': {
    icon: Briefcase,
    subTypes: [
      { name: 'خطاب عرض سعر', icon: FileText },
      { name: 'خطاب شراكة', icon: User },
      { name: 'خطاب تعريف بالشركة', icon: Building2 },
      { name: 'أخرى', icon: FileText }
    ]
  },
  'شخصي': {
    icon: User,
    subTypes: [
      { name: 'خطاب شكر', icon: Heart },
      { name: 'خطاب اعتذار', icon: AlertCircle },
      { name: 'خطاب تهنئة', icon: Sparkles },
      { name: 'أخرى', icon: FileText }
    ]
  }
};

const getLetterTypeData = (type: string) => {
  if (type === 'إداري/رسمي') return letterTypes['إداري/رسمي'];
  if (type === 'أعمال') return letterTypes['أعمال'];
  if (type === 'شخصي') return letterTypes['شخصي'];
  return letterTypes['إداري/رسمي'];
};

const escapeHtml = (unsafe: string) => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const sanitizeUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  return '';
};

const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

interface PrintElementOptions {
  fontFamily: string;
  fontSize: number;
  isEn: boolean;
  subject: string;
  letterContent: string;
  branding: {
    enableHeader: boolean;
    enableFooter: boolean;
    companyName?: string;
    companyDetails?: string;
    logoUrl?: string;
    footerText?: string;
  };
  signatureImage: string | null;
  sealImage: string | null;
}

const applyStyles = (el: HTMLElement, styles: Record<string, string>) => {
  Object.assign(el.style, styles);
};

const buildPrintElement = (opts: PrintElementOptions): HTMLElement => {
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


const toneOptions = ['رسمي', 'مهني جداً', 'ودود', 'حماسي', 'إقناعي', 'حازم'];
const formalityOptions = ['رسمي جداً', 'رسمي', 'شبه رسمي', 'ودي (غير رسمي)'];

const predefinedTemplates = [
  {
    id: 'job_application',
    category: 'شركات خاصة',
    name: 'طلب وظيفة',
    icon: <Briefcase className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب طلب (وظيفة، إجازة، مساعدة)',
      subject: 'طلب التوظيف لشواغركم المتاحة',
      details: 'أرجو النظر في سيرتي الذاتية المرفقة لشغل الوظيفة المناسبة لمؤهلاتي.',
      tone: 'رسمية ومهنية',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'complaint',
    category: 'جهات حكومية',
    name: 'خطاب شكوى',
    icon: <AlertCircle className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب شكوى (تظلم، إبلاغ عن مشكلة)',
      subject: 'شكوى بخصوص [موضوع الشكوى]',
      details: 'أرجو التكرم بالنظر في الشكوى المذكورة أعلاه واتخاذ الإجراءات اللازمة.',
      tone: 'حازمة',
      formality: 'رسمي'
    }
  },
  {
    id: 'thank_you',
    category: 'شخصي',
    name: 'خطاب شكر',
    icon: <Heart className="w-5 h-5" />,
    data: {
      type: 'شخصي',
      subType: 'خطاب شكر',
      subject: 'شكر وتقدير',
      details: 'أود أن أعبر عن خالص شكري وامتناني على جهودكم المبذولة في [اسم المشروع/العمل].',
      tone: 'ودية',
      formality: 'شبه رسمي'
    }
  },
  {
    id: 'leave_request',
    category: 'شركات خاصة',
    name: 'طلب إجازة',
    icon: <Calendar className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب طلب (وظيفة، إجازة، مساعدة)',
      subject: 'طلب الموافقة على إجازة سنوية',
      details: 'أرجو التكرم بالموافقة على منحي إجازتي السنوية ابتداءً من تاريخ [تاريخ البداية] وحتى [تاريخ النهاية].',
      tone: 'رسمية ومهنية',
      formality: 'رسمي'
    }
  },
  {
    id: 'resignation',
    category: 'شركات خاصة',
    name: 'طلب استقالة',
    icon: <Briefcase className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'أخرى',
      subject: 'طلب قبول استقالة',
      details: 'أرجو التكرم بقبول استقالتي من العمل، على أن يكون آخر يوم عمل لي هو [التاريخ].',
      tone: 'رسمية ومهنية',
      formality: 'رسمي'
    }
  },
  {
    id: 'university_admission',
    category: 'جامعات',
    name: 'طلب قبول جامعي',
    icon: <FileText className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب طلب (وظيفة، إجازة، مساعدة)',
      subject: 'طلب التحاق ببرنامج [اسم البرنامج]',
      details: 'أرغب بالانضمام لجامعتكم الموقرة لدراسة [التخصص]، مرفق لكم كافة أوراقي وثبوتياتي.',
      tone: 'رسمية ومهنية',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'sponsorship_request',
    category: 'شركات خاصة',
    name: 'طلب رعاية',
    icon: <Sparkles className="w-5 h-5" />,
    data: {
      type: 'أعمال',
      subType: 'أخرى',
      subject: 'طلب رعاية لفعالية [اسم الفعالية]',
      details: 'نتشرف بدعوتكم لرعاية فعاليتنا القادمة والتي تهدف إلى [الهدف من الفعالية]، ونرى في شركتكم شريكاً مثالياً للنجاح.',
      tone: 'إقناعية',
      formality: 'رسمي'
    }
  },
  {
    id: 'official_invitation',
    category: 'إداري/رسمي',
    name: 'دعوة رسمية',
    icon: <Mail className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'أخرى',
      subject: 'دعوة لحضور [اسم المناسبة]',
      details: 'يسعدنا دعوتكم لحضور [اسم المناسبة] الذي سيقام يوم [اليوم] الموافق [التاريخ] في [المكان]، وذلك لمناقشة [موضوع المناسبة].',
      tone: 'رسمية ومهنية',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'promotion_request',
    category: 'شركات خاصة',
    name: 'طلب ترقية',
    icon: <Briefcase className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب طلب (وظيفة، إجازة، مساعدة)',
      subject: 'طلب النظر في ترقية وظيفية',
      details: 'أتقدم لسيادتكم بطلب للنظر في ترقيتي إلى منصب [المنصب المقترح]، بناءً على التقييمات الإيجابية وإنجازاتي خلال فترة عملي في الشركة.',
      tone: 'مهنية',
      formality: 'رسمي'
    }
  },
  {
    id: 'apology_letter',
    category: 'شخصي',
    name: 'خطاب اعتذار',
    icon: <AlertCircle className="w-5 h-5" />,
    data: {
      type: 'شخصي',
      subType: 'خطاب اعتذار',
      subject: 'رسالة اعتذار عن [سبب الاعتذار]',
      details: 'أتقدم بخالص الاعتذار عن [الخطأ أو الموقف]، وأؤكد لكم حرصي التام على عدم تكرار ذلك وتدارك الأمر بأفضل صورة.',
      tone: 'ودية',
      formality: 'شبه رسمي'
    }
  },
  {
    id: 'quotation',
    category: 'أعمال',
    name: 'عرض سعر',
    icon: <FileText className="w-5 h-5" />,
    data: {
      type: 'أعمال',
      subType: 'خطاب عرض سعر',
      subject: 'عرض سعر لتقديم خدمات [نوع الخدمة]',
      details: 'بناءً على طلبكم، نرفق لكم عرض السعر الخاص بتقديم خدمات [نوع الخدمة]، آملين أن ينال إعجابكم ويلبي تطلعاتكم.',
      tone: 'رسمية ومهنية',
      formality: 'رسمي'
    }
  },
  {
    id: 'company_intro',
    category: 'أعمال',
    name: 'خطاب تعريف بالشركة',
    icon: <Building2 className="w-5 h-5" />,
    data: {
      type: 'أعمال',
      subType: 'خطاب تعريف بالشركة',
      subject: 'نبذة تعريفية عن شركة [اسم شركتك]',
      details: 'نتشرف بأن نضع بين أيديكم نبذة تعريفية عن شركتنا وخدماتنا المتميزة في مجال [مجال العمل]، آملين فتح آفاق التعاون المشترك بيننا.',
      tone: 'إقناعية',
      formality: 'رسمي'
    }
  },
  {
    id: 'financial_claim',
    category: 'أعمال',
    name: 'مطالبة مالية',
    icon: <FileText className="w-5 h-5" />,
    data: {
      type: 'أعمال',
      subType: 'أخرى',
      subject: 'مطالبة مالية بشأن الفاتورة رقم [رقم الفاتورة]',
      details: 'نود تذكيركم بضرورة تسديد المبلغ المستحق وقدره [المبلغ] والخاص بالفاتورة المذكورة، نرجو التكرم بالتحويل في أقرب وقت.',
      tone: 'حازمة',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'employee_transfer',
    category: 'شركات خاصة',
    name: 'طلب نقل',
    icon: <Briefcase className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب طلب (وظيفة، إجازة، مساعدة)',
      subject: 'طلب نقل داخلي إلى قسم [اسم القسم]',
      details: 'أتقدم لسيادتكم بطلب الموافقة على نقلي إلى [اسم القسم/الفرع] نظراً لظروفي الحالية أو رغبتي في تطوير مساري المهني.',
      tone: 'مهنية',
      formality: 'رسمي'
    }
  },
  {
    id: 'warning_letter',
    category: 'إداري/رسمي',
    name: 'إنذار موظف',
    icon: <AlertCircle className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'أخرى',
      subject: 'إنذار كتابي بسبب [سبب الإنذار]',
      details: 'نوجه إليكم هذا الإنذار كتابي لعدم الالتزام بـ [لوائح العمل/الحضور]، ونأمل عدم تكرار ذلك لتجنب اتخاذ إجراءات إدارية أشد.',
      tone: 'حازمة',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'financial_assistance',
    category: 'جهات حكومية',
    name: 'طلب مساعدة مالية',
    icon: <Heart className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب طلب (وظيفة، إجازة، مساعدة)',
      subject: 'طلب تقديم مساعدة مالية عاجلة',
      details: 'أتقدم لسيادتكم بطلبي هذا راجياً من الله ثم منكم مد يد العون والمساعدة لمواجهة ظروفي المادية الصعبة المتمثلة في [اذكر الظروف هنا].',
      tone: 'رسمية ومهنية',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'strategic_partnership',
    category: 'أعمال',
    name: 'طلب شراكة استراتيجية',
    icon: <User className="w-5 h-5" />,
    data: {
      type: 'أعمال',
      subType: 'خطاب شراكة',
      subject: 'طلب بناء شراكة استراتيجية وتعاون مشترك',
      details: 'يسرنا في شركة [اسم شركتك] أن نعرب عن اهتمامنا البالغ بإنشاء علاقة شراكة استراتيجية مع شركتكم الموقرة لتبادل الخبرات وتوسيع نطاق الأعمال في مجال [المجال المشترك].',
      tone: 'إقناعية',
      formality: 'رسمي'
    }
  },
  {
    id: 'promotion_congrats',
    category: 'شخصي',
    name: 'تهنئة بترقية',
    icon: <Sparkles className="w-5 h-5" />,
    data: {
      type: 'شخصي',
      subType: 'خطاب تهنئة',
      subject: 'تهنئة حارة بمناسبة الترقية الجديدة',
      details: 'أتقدم لسيادتكم بأسمى آيات التهاني والتبريكات بمناسبة ترقيتكم إلى منصب [المنصب الجديد]، متمنياً لكم مزيداً من النجاح والتألق في مسيرتكم المهنية.',
      tone: 'ودية',
      formality: 'شبه رسمي'
    }
  },
  {
    id: 'condolence_letter',
    category: 'شخصي',
    name: 'خطاب تعزية ومواساة',
    icon: <Heart className="w-5 h-5" />,
    data: {
      type: 'شخصي',
      subType: 'أخرى',
      subject: 'رسالة تعزية ومواساة بوفاة [اسم الفقيد]',
      details: 'ببالغ الحزن والأسى تلقينا نبأ وفاة المغفور له بإذن الله [اسم الفقيد]، ونعرب لكم عن خالص تعازينا وصادق مواساتنا، داعين الله أن يتغمده بواسع رحمته ويلهمكم الصبر والسلوان.',
      tone: 'ودية',
      formality: 'شبه رسمي'
    }
  },
  {
    id: 'coop_training',
    category: 'جامعات',
    name: 'طلب تدريب تعاوني/صيفي',
    icon: <FileText className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب طلب (وظيفة، إجازة، مساعدة)',
      subject: 'طلب فرصة تدريب تعاوني/عملي',
      details: 'أنا الطالب [اسمك] من تخصص [التخصص]، أرغب في التقدم بطلب للحصول على فرصة تدريب عملي في شركتكم الموقرة كجزء من متطلبات التخرج وتطبيق ما تعلمته نظرياً.',
      tone: 'رسمية ومهنية',
      formality: 'رسمي'
    }
  },
  {
    id: 'official_delegation',
    category: 'إداري/رسمي',
    name: 'تفويض رسمي',
    icon: <User className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'أخرى',
      subject: 'خطاب تفويض رسمي لإتمام إجراءات [موضوع التفويض]',
      details: 'أنا الموقع أدناه [اسمك]، أفوض بموجب هذا الخطاب السيد/ة [اسم المفوض له] بحمل بطاقة رقم [رقم البطاقة] للقيام بـ [المهام المحددة للتفويض] نيابة عني والتوقيع على الأوراق اللازمة.',
      tone: 'حازمة',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'undertaking_letter',
    category: 'إداري/رسمي',
    name: 'إقرار وتعهد',
    icon: <FileText className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'أخرى',
      subject: 'إقرار وتعهد بالالتزام بـ [موضوع التعهد]',
      details: 'أنا الموقع أدناه [اسمك] أقر وأتعهد بكامل أهليتي المعتبرة شرعاً وقانوناً بالالتزام بكافة الشروط والأحكام الخاصة بـ [الموضوع/الاتفاقية] وبذل كل الجهد لتنفيذ ذلك دون أي تقصير.',
      tone: 'حازمة',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'termination_letter',
    category: 'شركات خاصة',
    name: 'إنهاء خدمة موظف',
    icon: <AlertCircle className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'أخرى',
      subject: 'إشعار رسمي بإنهاء خدمة/عقد العمل',
      details: 'نأسف لإبلاغكم بأنه قد تم اتخاذ القرار بإنهاء عقد العمل الخاص بكم اعتباراً من تاريخ [التاريخ]، وذلك نظراً لـ [أسباب إنهاء الخدمة مثل إعادة الهيكلة/عدم تلبية معايير الأداء]، شاكرين لكم جهودكم السابقة.',
      tone: 'حازمة',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'bank_funding',
    category: 'أعمال',
    name: 'طلب تسهيلات بنكية/تمويل',
    icon: <FileText className="w-5 h-5" />,
    data: {
      type: 'أعمال',
      subType: 'أخرى',
      subject: 'طلب الحصول على تمويل / تسهيلات بنكية لمشروع [اسم المشروع]',
      details: 'نتوجه إليكم بطلبنا هذا لدراسة إمكانية منح شركتنا تسهيلات ائتمانية/تمويلية بقيمة [المبلغ]، وذلك لغرض توسيع أنشطتنا الاستثمارية وتمويل خطتنا التشغيلية لعام [السنة].',
      tone: 'رسمية ومهنية',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'medical_report',
    category: 'جهات حكومية',
    name: 'طلب تقرير طبي',
    icon: <Heart className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب طلب (وظيفة، إجازة، مساعدة)',
      subject: 'طلب الحصول على تقرير طبي مفصل',
      details: 'أرجو التكرم بالموافقة على تزويدي بتقرير طبي مفصل عن حالتي الصحية/حالة المريض [اسم المريض] خلال فترة العلاج بـ [اسم المستشفى/العيادة] لتقديمه إلى الجهات المختصة.',
      tone: 'رسمية ومهنية',
      formality: 'رسمي'
    }
  }
];

const fontFamilies = [
  { label: 'كايرو (Cairo)', value: 'Cairo' },
  { label: 'أميري (Amiri)', value: 'Amiri' },
  { label: 'تجوّال (Tajawal)', value: 'Tajawal' },
  { label: 'ترادشنال أرابيك (Traditional Arabic)', value: 'Traditional Arabic, Amiri, serif' },
  { label: 'أريال (Arial)', value: 'Arial, sans-serif' }
];

const fontSizes = [
  { label: 'صغير جداً (12px)', value: '12px' },
  { label: 'صغير (14px)', value: '14px' },
  { label: 'متوسط (15px)', value: '15px' },
  { label: 'كبير (16px)', value: '16px' },
  { label: 'كبير جداً (18px)', value: '18px' },
  { label: 'ضخم (20px)', value: '20px' }
];

const CustomSelect = ({ options, value, onChange, label }: { options: {label: string, value: string, icon?: any}[], value: string, onChange: (val: string) => void, label?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value) || options[0];
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 relative" ref={wrapperRef}>
      {label && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">{label}</div>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 bg-white font-medium text-gray-700 outline-none transition-all"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption?.icon && React.createElement(selectedOption.icon, { className: "w-4 h-4 text-gray-500 shrink-0" })}
          <span className="truncate text-right block w-full">{selectedOption?.label}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-500 shrink-0 mr-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{opacity: 0, y: -5}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -5}} transition={{duration: 0.15}}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-right hover:bg-gray-50 transition-colors ${value === opt.value ? 'bg-brown-50 text-brown-700 font-bold' : 'text-gray-700 font-medium'} flex-1 min-w-0`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.icon && React.createElement(opt.icon, { className: `w-4 h-4 shrink-0 ${value === opt.value ? 'text-brown-600' : 'text-gray-400'}` })}
                <span className="truncate block w-full">{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const ObjectKeys = Object.keys(letterTypes) as (keyof typeof letterTypes)[];
  const [form, setForm] = useState({
    type: ObjectKeys[0],
    subType: letterTypes['إداري/رسمي'].subTypes[0].name,
    senderName: '',
    recipientName: '',
    recipientRole: '',
    subject: '',
    details: '',
    tone: toneOptions[0],
    formality: formalityOptions[1],
    language: 'ar',
    date: new Date().toISOString().split('T')[0]
  });

  const [generatedLetter, setGeneratedLetterState] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const updateLetterContent = (newContent: string, addToHistory = true) => {
    setGeneratedLetterState(newContent);
    const currentHistItem = historyIndex >= 0 ? history.at(historyIndex) : undefined;
    if (addToHistory && newContent !== currentHistItem) {
      setHistory(prev => {
        const sliced = prev.slice(0, historyIndex + 1);
        const newHistory = [...sliced, newContent].slice(-50);
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setGeneratedLetterState(history.at(prevIndex) || '');
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setGeneratedLetterState('');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setGeneratedLetterState(history.at(nextIndex) || '');
    }
  };

  const toggleFavoritePredefined = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoritePredefined(prev => {
      const next = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      if (user) syncUserDataToCloud(user, { savedLetters, favoriteTemplates, favoritePredefined: next });
      return next;
    });
  };

  const toggleFavorite = (type: string, subType: string) => {
    setFavoriteTemplates(prev => {
      const exists = prev.some(p => p.type === type && p.subType === subType);
      const next = exists 
        ? prev.filter(p => !(p.type === type && p.subType === subType))
        : [...prev, {type, subType}];
      if (user) syncUserDataToCloud(user, { savedLetters, favoriteTemplates: next, favoritePredefined });
      return next;
    });
  };

  // Cloud Sync Listener
  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToCloudData(user, (data) => {
      if (data.savedLetters) setSavedLetters(data.savedLetters);
      if (data.favoriteTemplates) setFavoriteTemplates(data.favoriteTemplates);
      if (data.favoritePredefined) setFavoritePredefined(data.favoritePredefined);
    });
    return () => unsubscribe();
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [draftStatus, setDraftStatus] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState('Cairo');
  const [fontSize, setFontSize] = useState('15px');
  const [isProofreading, setIsProofreading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [archiveTab, setArchiveTab] = useState<'all' | 'saved' | 'drafts'>('all');

  // App Language State
  const [appLang, setAppLang] = useState<'ar' | 'en'>('ar');
  const t = (arText: string, enText: string) => appLang === 'ar' ? arText : enText;

  // Stats & Tags States
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [pendingTags, setPendingTags] = useState<string[]>([]);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', attachPdf: true });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);

  // Template Library States
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [libraryTab, setLibraryTab] = useState<'system' | 'custom'>('system');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Branding & E-Signature States
  const [activeSection, setActiveSection] = useState<'basic' | 'branding' | 'signature'>('basic');
  const [branding, setBranding] = useState({
    enableHeader: false,
    theme: 'classic',
    companyName: '',
    companyDetails: '',
    logoUrl: '',
    enableFooter: false,
    footerText: '',
  });
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [sealImage, setSealImage] = useState<string | null>(null);
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // A/B Testing State
  const [abTestVariant] = useState<'A' | 'B'>(() => {
    const saved = localStorage.getItem('ab_test_variant');
    if (saved === 'A' || saved === 'B') return saved;
    const variant = Math.random() > 0.5 ? 'A' : 'B';
    localStorage.setItem('ab_test_variant', variant);
    return variant;
  });

  // UX Features States
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const themeToggleRef = useRef<HTMLButtonElement>(null);

  const toggleDarkMode = () => {
    // @ts-ignore
    if (!document.startViewTransition) {
      setDarkMode(prev => !prev);
      return;
    }
    // @ts-ignore
    document.startViewTransition(() => {
      flushSync(() => {
        setDarkMode(prev => !prev);
      });
    });
  };
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');

  // Favorite Templates State (from dropdown)
  const [favoriteTemplates, setFavoriteTemplates] = useState<{type: string, subType: string}[]>(() => {
    try {
      const saved = localStorage.getItem('favoriteTemplates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Favorite Predefined Templates State (from library)
  const [favoritePredefined, setFavoritePredefined] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('favoritePredefined');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sharing states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleExportDOCX = () => {
    if (!generatedLetter) return;
    
    const headerHtml = branding.enableHeader ? (
      '<div style="border-bottom: 2px solid #a18072; padding-bottom: 10px; margin-bottom: 20px; font-family: Arial, sans-serif;">' +
        '<h3 style="color: #a18072; margin: 0; font-size: 16px;">' + escapeHtml(branding.companyName || '') + '</h3>' +
        '<p style="font-size: 11px; color: #555; margin: 5px 0 0 0; line-height: 1.4;">' + escapeHtml(branding.companyDetails || '').replace(/\n/g, '<br />') + '</p>' +
      '</div>'
    ) : '';
    
    const footerHtml = branding.enableFooter ? (
      '<div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 30px; text-align: center; font-size: 10px; color: #777; font-family: Arial, sans-serif;">' +
        escapeHtml(branding.footerText || '') +
      '</div>'
    ) : '';

    const signatureHtml = (signatureImage || sealImage) ? (
      '<div style="margin-top: 40px; font-family: Arial, sans-serif;">' +
        '<p style="font-size: 12px; font-weight: bold; color: #222; margin-bottom: 8px;">التوقيع والختم:</p>' +
        '<div>' +
          (signatureImage ? ('<img src="' + sanitizeUrl(signatureImage) + '" width="120" style="margin-right: 15px; vertical-align: middle;" />') : '') +
          (sealImage ? ('<img src="' + sanitizeUrl(sealImage) + '" width="90" style="vertical-align: middle;" />') : '') +
        '</div>' +
      '</div>'
    ) : '';

    const htmlContent = 
      '<html xmlns:o=\'urn:schemas-microsoft-com:office:office\' xmlns:w=\'urn:schemas-microsoft-com:office:word\' xmlns=\'http://www.w3.org/TR/REC-html40\'>' +
      '<head>' +
        '<title>' + escapeHtml(form.subject) + '</title>' +
        '<meta charset="utf-8">' +
        '<style>' +
          'body {' +
            'font-family: \'Arial\', serif;' +
            'direction: ' + (form.language === 'en' ? 'ltr' : 'rtl') + ';' +
            'text-align: ' + (form.language === 'en' ? 'left' : 'right') + ';' +
            'line-height: 1.6;' +
          '}' +
          'h2 {' +
            'text-align: center;' +
            'color: #222;' +
            'font-size: 18px;' +
          '}' +
          '.main-content {' +
            'font-size: 13px;' +
            'color: #333;' +
            'white-space: pre-line;' +
          '}' +
        '</style>' +
      '</head>' +
      '<body>' +
        headerHtml +
        '<h2>' + escapeHtml(form.subject) + '</h2>' +
        '<div class="main-content">' + escapeHtml(generatedLetter) + '</div>' +
        signatureHtml +
        footerHtml +
      '</body>' +
      '</html>';

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.subject || 'خطاب_رسمي'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // AI Assistant states
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPolishing, setAiPolishing] = useState(false);
  const [toneResult, setToneResult] = useState<{
    toneName: string;
    formalityScore: number;
    summary: string;
    suggestions: string[];
  } | null>(null);
  const [toneLoading, setToneLoading] = useState(false);

  const handlePolishLetter = async () => {
    if (!generatedLetter) return;
    if (!isOnline) {
      alert('أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتحسين الصياغة بالذكاء الاصطناعي.');
      return;
    }
    setAiPolishing(true);
    try {
      const response = await fetch('/api/polish-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generatedLetter, language: form.language }),
      });

      if (!response.ok) throw new Error('فشل تحسين الصياغة');
      const data = await response.json();
      updateLetterContent(data.letter);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تحسين الصياغة');
    } finally {
      setAiPolishing(false);
    }
  };

  const handleAnalyzeTone = async () => {
    if (!generatedLetter) return;
    if (!isOnline) {
      alert('أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتحليل نبرة الخطاب.');
      return;
    }
    setToneLoading(true);
    setToneResult(null);
    try {
      const response = await fetch('/api/analyze-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generatedLetter, language: form.language }),
      });

      if (!response.ok) throw new Error('فشل تحليل النبرة');
      const data = await response.json();
      setToneResult(data);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تحليل النبرة');
    } finally {
      setToneLoading(false);
    }
  };

  const handleCreateShareLink = async () => {
    if (!generatedLetter) return;
    setShareLoading(true);
    setShareUrl('');
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.subject || 'خطاب رسمي',
          content: generatedLetter,
          branding,
          signatureImage,
          sealImage,
          language: form.language,
          password: sharePassword || undefined
        }),
      });

      if (!response.ok) throw new Error('فشل إنشاء رابط المشاركة');
      const data = await response.json();
      setShareUrl(data.url);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setShareLoading(false);
    }
  };

  // Dark Mode Effect
  useEffect(() => {
    // We do NOT add 'theme-transition' here anymore to avoid FOUC.
    // CSS transitions on initial mount cause the background to animate from light to dark.
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Offline Mode Effect
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // OCR Upload and API Caller
  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrError('');

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result !== 'string') {
          setOcrError('فشل قراءة ملف الصورة');
          setOcrLoading(false);
          return;
        }

        try {
          const res = await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'فشل استخراج النصوص');

          if (data.text) {
            setForm(prev => ({ ...prev, details: data.text }));
            setActiveSection('basic');
            setIsOcrOpen(false);
          } else {
            setOcrError('لم يتم العثور على نصوص واضحة في الصورة');
          }
        } catch (err: any) {
          setOcrError(err.message || 'حدث خطأ أثناء معالجة الصورة');
        } finally {
          setOcrLoading(false);
        }
      };

      reader.onerror = () => {
        setOcrError('حدث خطأ أثناء قراءة ملف الصورة');
        setOcrLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setOcrError('فشل تحميل الصورة');
      setOcrLoading(false);
    }
  };

  // Voice Input Handler
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('متصفحك لا يدعم الإدخال الصوتي. استخدم Google Chrome للحصول على أفضل تجربة.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = form.language === 'en' ? 'en-US' : 'ar-SA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm(prev => ({ ...prev, details: prev.details ? prev.details + ' ' + transcript : transcript }));
    };

    recognition.start();
  };

  // Toggle pin letter
  const handleTogglePin = (e: React.MouseEvent, letterId: string) => {
    e.stopPropagation();
    const updated = savedLetters.map(l =>
      l.id === letterId ? { ...l, isPinned: !l.isPinned } : l
    );
    setSavedLetters(updated);
    localStorage.setItem('saved_letters', JSON.stringify(updated));
  };

  // Word / char counter
  const wordCount = generatedLetter ? generatedLetter.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = generatedLetter ? generatedLetter.length : 0;

  // Setup drawing events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureImage(dataUrl);
    setIsSigningOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature' | 'seal') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (type === 'logo') {
          setBranding(prev => ({ ...prev, logoUrl: reader.result as string }));
        } else if (type === 'signature') {
          setSignatureImage(reader.result);
        } else if (type === 'seal') {
          setSealImage(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Dynamic Variables extraction
  const extractVariables = (text: string) => {
    const matches = text.match(/\[(.*?)\]/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  };
  const currentVariables = Array.from(new Set([
    ...extractVariables(form.subject),
    ...extractVariables(form.details)
  ]));

  const replaceVariable = (variable: string, value: string) => {
    if (!value) return;
    const target = '[' + variable + ']';
    setForm(prev => ({
      ...prev,
      subject: prev.subject.replaceAll(target, value),
      details: prev.details.replaceAll(target, value)
    }));
  };
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load local data on mount
  useEffect(() => {
    // We only load local data initially. If logged in, cloud listener will override it.
    try {
      const saved = localStorage.getItem('savedLetters');
      if (saved) {
        try {
          setSavedLetters(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [generatedLetter]);

  React.useEffect(() => {
    const saved = localStorage.getItem('saved_letters');
    if (saved) {
      try {
        setSavedLetters(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    const savedTpls = localStorage.getItem('custom_templates');
    if (savedTpls) {
      try {
        setCustomTemplates(JSON.parse(savedTpls));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveCustomTemplate = () => {
    if (!newTemplateName) return;
    const newTpl = {
      id: `custom_${Date.now()}`,
      name: newTemplateName,
      data: { ...form }
    };
    const updated = [...customTemplates, newTpl];
    setCustomTemplates(updated);
    localStorage.setItem('custom_templates', JSON.stringify(updated));
    setNewTemplateName('');
    setIsSavingTemplate(false);
  };

  const applyTemplate = (templateId: string, isCustom = false) => {
    const templateList = isCustom ? customTemplates : predefinedTemplates;
    const template = templateList.find(t => t.id === templateId);
    if (template) {
      setForm({ ...form, ...template.data });
      setActiveTemplate(templateId);
      setIsLibraryOpen(false);
    }
  };

  const handleSave = () => {
    if (!generatedLetter) return;
    const newLetter: SavedLetter = {
      id: Date.now().toString(),
      subject: form.subject || 'خطاب بدون عنوان',
      date: new Date().toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' }),
      content: generatedLetter,
      type: form.type,
      isDraft: false,
      formData: form,
      tags: pendingTags.length > 0 ? [...pendingTags] : undefined,
      savedAt: Date.now()
    };
    const updated = [newLetter, ...savedLetters];
    setSavedLetters(updated);
    localStorage.setItem('saved_letters', JSON.stringify(updated));
    setPendingTags([]);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleSaveDraft = () => {
    const newLetter: SavedLetter = {
      id: Date.now().toString(),
      subject: form.subject || 'مسودة خطاب',
      date: new Date().toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' }),
      content: generatedLetter || '',
      type: form.type,
      isDraft: true,
      formData: form
    };
    const updated = [newLetter, ...savedLetters];
    setSavedLetters(updated);
    localStorage.setItem('saved_letters', JSON.stringify(updated));
    setDraftStatus(true);
    setTimeout(() => setDraftStatus(false), 2000);
  };

  const handleLoadSaved = (letter: SavedLetter) => {
    updateLetterContent(letter.content);
    if (letter.formData) {
      setForm(letter.formData);
    }
    setIsArchiveOpen(false);
  };

  const handleSuggestTitle = async () => {
    if (!isOnline) {
      alert('أنت غير متصل بالإنترنت حالياً. لا يمكن اقتراح عنوان للخطاب بدون اتصال.');
      return;
    }
    setIsSuggestingTitle(true);
    try {
      const response = await fetch('/api/suggest-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          subType: form.subType,
          details: form.details,
          language: form.language
        }),
      });

      if (!response.ok) throw new Error('فشل في اقتراح العنوان');
      
      const data = await response.json();
      if (data.title) {
        setForm(prev => ({ ...prev, subject: data.title }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggestingTitle(false);
    }
  };

  const handleProofread = async () => {
    if (!generatedLetter) return;
    if (!isOnline) {
      setError('أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتشغيل التدقيق الإملائي بالذكاء الاصطناعي.');
      return;
    }
    setIsProofreading(true);
    setError('');
    
    try {
      const response = await fetch('/api/proofread-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: generatedLetter, 
          language: form.language 
        }),
      });

      if (!response.ok) {
        throw new Error('حدث خطأ أثناء التدقيق اللغوي');
      }

      const data = await response.json();
      updateLetterContent(data.letter);
    } catch (err) {
      console.error(err);
      setError('فشل التحديث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProofreading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    if (!generatedLetter) return;

    let parsedFontSize = parseInt(fontSize);
    if (isNaN(parsedFontSize)) parsedFontSize = 15;

    const printElement = buildPrintElement({
      fontFamily,
      fontSize: parsedFontSize + 2,
      isEn: form.language === 'en',
      subject: form.subject || 'خطاب',
      letterContent: generatedLetter,
      branding,
      signatureImage,
      sealImage,
    });

    const opt: any = {
      margin:      15,
      filename:    `${form.subject || 'letter'}.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(printElement).save();
  };

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject) return;

    setIsSendingEmail(true);
    setEmailSuccess(null);
    let pdfAttachmentBase64 = null;

    try {
      if (emailForm.attachPdf) {
        let parsedFontSize = parseInt(fontSize);
        if (isNaN(parsedFontSize)) parsedFontSize = 15;
        const pdfFontSize = parsedFontSize + 2;
        
        const printElement = buildPrintElement({
          fontFamily,
          fontSize: pdfFontSize,
          isEn: form.language === 'en',
          subject: form.subject || 'خطاب',
          letterContent: generatedLetter,
          branding,
          signatureImage,
          sealImage,
        });
        
        const opt: any = {
          margin: 15,
          filename: 'letter.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        pdfAttachmentBase64 = await html2pdf().set(opt).from(printElement).outputPdf('datauristring');
      }

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailForm.to,
          subject: emailForm.subject,
          text: generatedLetter,
          pdfAttachment: pdfAttachmentBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      
      if (data.previewUrl) {
        setEmailSuccess(`تم الإرسال بنجاح (Ethereal test email). رابط المعاينة: ${data.previewUrl}`);
      } else {
        setEmailSuccess('تم إرسال البريد الإلكتروني بنجاح!');
      }

      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailSuccess(null);
      }, 5000);
      
    } catch (err: any) {
      setEmailSuccess(null);
      console.error(err);
      alert('حدث خطأ أثناء إرسال البريد الإلكتروني');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const generateLetter = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.senderName || !form.recipientName || !form.subject) {
      setError('يرجى تعبئة الحقول الإلزامية الأساسية');
      return;
    }
    if (!isOnline) {
      setError('أنت غير متصل بالإنترنت حالياً. يمكنك كتابة وتعديل النص يدوياً وحفظ الخطاب كمسودة.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء الإنشاء');
      }
      updateLetterContent(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!form.senderName || !form.recipientName || !form.subject) return;

    const timer = setTimeout(() => {
      generateLetter();
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const filteredLetters = savedLetters
    .filter(letter => {
      const matchesSearch = (
        letter.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
        letter.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        letter.date.includes(searchQuery)
      );
      const matchesFilter = filterType === 'all' || letter.type === filterType;
      const matchesTag = !filterTag || (letter.tags && letter.tags.includes(filterTag));
      let matchesTab = true;
      if (archiveTab === 'drafts') matchesTab = !!letter.isDraft;
      if (archiveTab === 'saved') matchesTab = !letter.isDraft;
      return matchesSearch && matchesFilter && matchesTab && matchesTag;
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20" dir={appLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="h-[68px] sticky top-0 z-40 flex items-center transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-[12px] flex items-center justify-center shadow-lg transition-all" style={{ backgroundColor: 'var(--color-logo-bg)', borderColor: 'var(--color-logo-border)', borderWidth: '1px', borderStyle: 'solid' }}>
                <svg viewBox="0 0 100 100" className="w-6 h-6 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="nibGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-logo-start)" />
                      <stop offset="100%" stopColor="var(--color-logo-end)" />
                    </linearGradient>
                    <linearGradient id="nibGradAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-logo-accent-start)" />
                      <stop offset="100%" stopColor="var(--color-logo-accent-end)" />
                    </linearGradient>
                  </defs>
                  
                  {/* Classical Column/Pillar Cap at the top */}
                  <path d="M 28,12 L 72,12 L 72,18 L 28,18 Z" fill="url(#nibGradAccent)" />
                  <path d="M 34,22 L 66,22 L 66,27 L 34,27 Z" fill="url(#nibGradAccent)" />
                  
                  {/* Main Nib pointing downwards */}
                  <path d="M 42,30 H 58 C 58,40 66,48 66,56 C 66,68 50,88 50,88 C 50,88 34,68 34,56 C 34,40 42,30 42,30 Z" fill="url(#nibGrad)" />
                  
                  {/* Slit & Breather Hole (cutout effect using container bg) */}
                  <line x1="50" y1="56" x2="50" y2="88" stroke="var(--color-logo-bg)" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="50" cy="56" r="4.5" fill="var(--color-logo-bg)" />
                </svg>
              </div>
              <div className="absolute -inset-0.5 rounded-[12px] opacity-20 blur-sm" style={{ backgroundColor: 'var(--color-logo-start)' }} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-gray-900 leading-none" style={{letterSpacing: '-0.02em'}}>
                {t('صياغة', 'Siyagha')}
              </h1>
              <p className="text-[10px] font-semibold text-brown-500 opacity-80 hidden sm:block">{t('بالذكاء الاصطناعي', 'Powered by AI')}</p>
            </div>
            {/* Online/Offline indicator */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
              {isOnline
                ? <Wifi className="w-3 h-3" />
                : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{isOnline ? t('متصل', 'Online') : t('أوفلاين', 'Offline')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-gray-400 hidden lg:block border border-gray-100 bg-gray-50/80 px-3 py-1.5 rounded-full">
              {t('خطابات رسمية واحترافية بلمسة واحدة', 'Professional letters in one click')}
            </p>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 hidden sm:block truncate max-w-[100px]">{user.displayName || user.email}</span>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl text-red-600 dark:text-red-400 hover:text-white border border-red-200/80 dark:border-red-500/20 bg-red-50/80 dark:bg-red-500/10 hover:bg-red-500 dark:hover:bg-red-500 hover:border-red-600 transition-all"
                  title="تسجيل الخروج"
                  type="button"
                >
                  خروج
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-3 py-1.5 text-xs font-bold rounded-xl text-brown-600 dark:text-brown-400 hover:text-white border border-brown-200/80 dark:border-brown-500/20 bg-brown-50/80 dark:bg-brown-500/10 hover:bg-brown-600 dark:hover:bg-brown-600 hover:border-brown-600 transition-all flex items-center gap-1.5"
                title="تسجيل الدخول باستخدام جوجل"
                type="button"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">دخول</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setAppLang(appLang === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl text-gray-600 hover:text-brown-600 border border-gray-200/80 bg-gray-50/80 hover:bg-brown-50 hover:border-brown-200 transition-all"
              title={t('تغيير اللغة', 'Change Language')}
              type="button"
            >
              {appLang === 'ar' ? 'EN' : 'عربي'}
            </button>

            {/* Dark Mode Toggle */}
            <button
              ref={themeToggleRef}
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200/80 bg-gray-50/80 text-gray-500 hover:text-brown-600 hover:border-brown-200 hover:bg-brown-50 transition-all cursor-pointer overflow-hidden"
              title={darkMode ? t('الوضع المضيء', 'Light Mode') : t('الوضع الداكن', 'Dark Mode')}
              type="button"
            >
              <AnimatePresence mode="wait" initial={false}>
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    className="flex items-center justify-center"
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -90, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    className="flex items-center justify-center"
                  >
                    <Moon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Archive */}
            <button
              onClick={() => setIsArchiveOpen(true)}
              className="relative flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-brown-600 border border-gray-200/80 bg-gray-50/80 hover:bg-brown-50 hover:border-brown-200 px-3 py-1.5 rounded-xl transition-all"
            >
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">{t('الأرشيف', 'Archive')}</span>
              {savedLetters.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-white text-[10px] rounded-full flex items-center justify-center font-black" style={{background: 'linear-gradient(135deg,#e86c1a,#c8520d)'}}>
                  {savedLetters.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-7 flex flex-col gap-8">
        
        {/* Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-brown-500/80 uppercase tracking-[0.12em] flex items-center gap-2">
              <span className="w-4 h-px bg-gradient-to-r from-brown-400 to-transparent inline-block"></span>
              {t('نماذج الاستخدام السريع', 'Quick Templates')}
            </h2>
            <div className="flex items-center gap-2">
              {/* Stats Toggle */}
              <button
                onClick={() => setIsStatsOpen(!isStatsOpen)}
                className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  isStatsOpen
                    ? 'bg-brown-600 text-white'
                    : 'text-brown-600 hover:text-brown-700 bg-brown-50 hover:bg-brown-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                {t('إحصائياتي', 'My Stats')}
              </button>
              <button 
                onClick={() => setIsLibraryOpen(true)}
                className="text-xs font-bold text-brown-600 hover:text-brown-700 flex items-center gap-1.5 bg-brown-50 hover:bg-brown-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Library className="w-4 h-4" />
                {t('مكتبة القوالب', 'Template Library')}
              </button>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <AnimatePresence>
            {isStatsOpen && (() => {
              const total = savedLetters.length;
              const drafts = savedLetters.filter(l => l.isDraft).length;
              const completed = total - drafts;
              const now = Date.now();
              const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
              const thisMonth = savedLetters.filter(l => l.savedAt && l.savedAt > monthAgo).length;
              const typeCounts = Object.keys(letterTypes).map(t => ({
                type: t,
                count: savedLetters.filter(l => l.type === t).length
              })).sort((a,b) => b.count - a.count);
              const maxCount = Math.max(...typeCounts.map(t => t.count), 1);
              const allTags = Array.from(new Set(savedLetters.flatMap(l => l.tags || [])));
              const pinnedCount = savedLetters.filter(l => l.isPinned).length;
              return (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mb-5"
                >
                  <div className="bg-white rounded-2xl border border-brown-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-7 h-7 bg-brown-100 rounded-lg flex items-center justify-center text-brown-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm">لوحة إحصائياتي</h3>
                      <span className="text-xs text-gray-400 mr-auto">بناءً على بياناتك المحفوظة محلياً</span>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      {[
                        { label: 'إجمالي الخطابات', value: total, icon: <FileText className="w-5 h-5" />, bgClass: 'bg-brown-50 border-brown-200/60 text-brown-600 dark:border-brown-200 dark:text-brown-500' },
                        { label: 'هذا الشهر', value: thisMonth, icon: <Calendar className="w-5 h-5" />, bgClass: 'bg-brown-50 border-brown-200/60 text-brown-600 dark:border-brown-200 dark:text-brown-500' },
                        { label: 'مكتملة', value: completed, icon: <Check className="w-5 h-5" />, bgClass: 'bg-brown-50 border-brown-200/60 text-brown-600 dark:border-brown-200 dark:text-brown-500' },
                        { label: 'مثبتة', value: pinnedCount, icon: <Pin className="w-5 h-5 -rotate-45" />, bgClass: 'bg-brown-50 border-brown-200/60 text-brown-600 dark:border-brown-200 dark:text-brown-500' },
                      ].map(kpi => (
                        <div key={kpi.label} className="bg-white rounded-2xl p-4 text-center border border-brown-200/50 shadow-sm flex flex-col items-center justify-between transition-all hover:scale-[1.03] hover:shadow-md hover:border-brown-300">
                          <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center mb-2 border ${kpi.bgClass}`}>
                            {kpi.icon}
                          </div>
                          <div className="text-3xl font-black text-gray-900">{kpi.value}</div>
                          <div className="text-[11px] font-extrabold text-brown-700 mt-1">{kpi.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Type Distribution Bar Chart */}
                    {total > 0 && (
                      <div className="mb-5">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">توزيع الأنواع</h4>
                        <div className="space-y-2">
                          {typeCounts.map(({ type, count }) => (
                            <div key={type} className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-gray-600 w-20 shrink-0 text-right">{type}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(count / maxCount) * 100}%` }}
                                  transition={{ duration: 0.6, delay: 0.1 }}
                                  className="h-2 bg-brown-500 rounded-full"
                                />
                              </div>
                              <span className="text-xs font-black text-brown-600 w-6 text-left">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Drafts ratio */}
                    {total > 0 && (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-semibold text-gray-500">نسبة الاكتمال:</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(completed / total) * 100}%` }}
                            transition={{ duration: 0.7 }}
                            className="h-2 bg-green-500 rounded-full"
                          />
                        </div>
                        <span className="font-black text-green-600">{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
                      </div>
                    )}

                    {/* All Tags */}
                    {allTags.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">الوسوم المستخدمة</h4>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setFilterTag('')}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                              filterTag === '' ? 'bg-brown-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >الكل</button>
                          {allTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => { setFilterTag(filterTag === tag ? '' : tag); setIsArchiveOpen(true); }}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                                filterTag === tag ? 'bg-brown-600 text-white' : 'bg-brown-50 text-brown-700 hover:bg-brown-100'
                              }`}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {total === 0 && (
                      <p className="text-center text-xs text-gray-400 py-4">لم تقم بحفظ أي خطابات بعد. ابدأ بإنشاء خطابك الأول!</p>
                    )}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...predefinedTemplates.filter(t => favoritePredefined.includes(t.id)), ...predefinedTemplates.filter(t => !favoritePredefined.includes(t.id))].slice(0, 4).map(template => (
              <button
                type="button"
                key={template.id}
                onClick={() => applyTemplate(template.id)}
                className={`group relative flex items-center gap-3 p-4 rounded-2xl border text-right transition-all hover:-translate-y-0.5 active:scale-[0.97] ${
                  activeTemplate === template.id
                    ? 'border-brown-400 bg-gradient-to-br from-brown-50 to-orange-50 text-brown-700 shadow-lg ring-2 ring-brown-400/25'
                    : 'border-gray-200/80 bg-white/80 hover:border-brown-300/70 text-gray-700 shadow-sm'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  activeTemplate === template.id
                    ? 'bg-white text-brown-600 shadow-sm'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-brown-100 group-hover:text-brown-600'
                }`}>
                  {template.icon}
                </div>
                {favoritePredefined.includes(template.id) && (
                  <button 
                    type="button"
                    onClick={(e) => toggleFavoritePredefined(template.id, e)}
                    className="absolute top-2 left-2 p-1 transition-transform hover:scale-110 z-10"
                    title="إزالة من المفضلة"
                  >
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                  </button>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm truncate">{template.name}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{template.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Form Column */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-brown-100/60 relative overflow-hidden">
            {/* decorative top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{background: 'linear-gradient(90deg, #e86c1a, #f9883a, #e86c1a)'}} />
            <h2 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2.5" style={{letterSpacing: '-0.01em'}}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg,#e86c1a,#c8520d)'}}>
                <PenLine className="w-3.5 h-3.5 text-white" />
              </div>
              {t('التخصيص والتفاصيل', 'Customization & Details')}
            </h2>

            {/* Tab Selector */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button 
                type="button"
                onClick={() => setActiveSection('basic')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeSection === 'basic' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('بيانات الخطاب', 'Letter Data')}
              </button>
              <button 
                type="button"
                onClick={() => setActiveSection('branding')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeSection === 'branding' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('الهوية والترويسة', 'Branding & Header')}
              </button>
              <button 
                type="button"
                onClick={() => setActiveSection('signature')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeSection === 'signature' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('التوقيع والختم', 'Signature & Seal')}
              </button>
            </div>

            <form onSubmit={generateLetter} className="space-y-4">
              {activeSection === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <CustomSelect
                      label="نوع الخطاب"
                      value={form.type}
                      onChange={(val) => setForm({...form, type: val as keyof typeof letterTypes, subType: getLetterTypeData(val).subTypes[0].name})}
                      options={Object.keys(letterTypes).map(t => ({
                        value: t,
                        label: t,
                        icon: getLetterTypeData(t).icon
                      }))}
                    />

                    <CustomSelect
                      label={
                        <div className="flex items-center justify-between">
                          <span>التصنيف</span>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(form.type, form.subType); }}
                            className="text-gray-400 hover:text-yellow-500 transition-colors"
                            title={favoriteTemplates.some(p => p.type === form.type && p.subType === form.subType) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                          >
                            <Star className={`w-3.5 h-3.5 ${favoriteTemplates.some(p => p.type === form.type && p.subType === form.subType) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </button>
                        </div>
                      }
                      value={form.subType}
                      onChange={(val) => setForm({...form, subType: val})}
                      options={getLetterTypeData(form.type).subTypes.map((st: any) => ({
                        value: st.name,
                        label: st.name,
                        icon: st.icon
                      }))}
                    />
                  </div>

                  {favoriteTemplates.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-0 mb-4">
                      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 py-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> المفضلة:
                      </span>
                      {favoriteTemplates.map(fav => (
                        <button 
                          key={`${fav.type}-${fav.subType}`}
                          type="button" 
                          onClick={() => setForm({...form, type: fav.type as any, subType: fav.subType})} 
                          className="text-[11px] bg-yellow-50/80 text-yellow-800 hover:bg-yellow-100 border border-yellow-200/60 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 font-bold shadow-sm"
                        >
                          {fav.subType}
                        </button>
                      ))}
                    </div>
                  )}

                  <hr className="border-gray-100 my-4 border-dashed" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">تاريخ الخطاب</label>
                      <input 
                        type="date"
                        className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all bg-white font-medium text-gray-700"
                        value={form.date}
                        onChange={e => setForm({...form, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5 relative z-10">
                      <CustomSelect 
                        label="لغة الخطاب (Language)"
                        value={form.language}
                        onChange={val => setForm({...form, language: val})}
                        options={[
                          { value: 'ar', label: 'العربية (Arabic)' },
                          { value: 'en', label: 'الإنجليزية (English)' }
                        ]}
                      />
                    </div>
                  </div>

                  <hr className="border-gray-100 my-4 border-dashed" />

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      اسم المرسل <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="اسمك أو اسم المؤسسة"
                      className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all"
                      value={form.senderName}
                      onChange={e => setForm({...form, senderName: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        اسم الموجه إليه <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="المؤسسة أو الشخص المتلقي"
                        className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all"
                        value={form.recipientName}
                        onChange={e => setForm({...form, recipientName: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                       صفة الموجه إليه
                      </label>
                      <input 
                        type="text" 
                        placeholder="مدير الموارد البشرية"
                        className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all"
                        value={form.recipientRole}
                        onChange={e => setForm({...form, recipientRole: e.target.value})}
                      />
                    </div>
                  </div>

                  <hr className="border-gray-100 my-4 border-dashed" />

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        موضوع الخطاب / عنوانه <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleSuggestTitle}
                        disabled={isSuggestingTitle}
                        className="text-xs text-brown-600 hover:text-brown-700 bg-brown-50 hover:bg-brown-100 flex items-center gap-1.5 px-2 py-1 rounded transition-colors disabled:opacity-50"
                        title="الذكاء الاصطناعي سيقوم باقتراح عنوان مناسب بناءً على التفاصيل"
                      >
                        {isSuggestingTitle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        اقتراح عنوان ذكي
                      </button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="اتركه فارغاً، أو ادخل مثال: طلب الموافقة على رصيد إجازة"
                      className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all"
                      value={form.subject}
                      onChange={e => setForm({...form, subject: e.target.value})}
                    />
                  </div>

                  <hr className="border-gray-100 my-4 border-dashed" />

                  <div className="space-y-2 mt-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">نبرة الخطاب (بنقرة زر)</label>
                    <div className="flex flex-wrap gap-2">
                      {toneOptions.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({...form, tone: t})}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                            form.tone === t 
                              ? 'bg-brown-600 text-white shadow-sm' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200/50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-100 my-4 border-dashed" />

                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <div className="space-y-1.5 relative z-10">
                      <CustomSelect 
                        label="مستوى الرسمية"
                        value={form.formality}
                        onChange={val => setForm({...form, formality: val})}
                        options={formalityOptions.map(t => ({ value: t, label: t }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-800">الصياغة الذكية: تفاصيل الخطاب / المبررات</label>
                      <div className="flex items-center gap-1.5">
                        {/* Voice Input Button */}
                        <button
                          type="button"
                          onClick={handleVoiceInput}
                          className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded transition-all ${
                            isListening
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'text-brown-600 hover:text-brown-700 bg-brown-50 hover:bg-brown-100'
                          }`}
                          title={isListening ? 'إيقاف الإدخال الصوتي' : 'إدخال صوتي'}
                        >
                          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                          {isListening ? 'جارٍ الاستماع...' : 'صوت'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsOcrOpen(true)}
                          className="text-xs text-brown-600 hover:text-brown-700 bg-brown-50 hover:bg-brown-100 flex items-center gap-1.5 px-2 py-1 rounded transition-colors"
                          title="قم بتحميل صورة لخطاب ورقي قديم لاستخراج النص منه بالذكاء الاصطناعي"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          OCR
                        </button>
                      </div>
                    </div>
                    <textarea 
                      rows={4}
                      placeholder="اكتب الغرض، وبعض نقاط القوة أو المبررات ليقوم الذكاء الاصطناعي بكتابة وتنسيق الخطاب بالكامل لك..."
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all resize-none ${
                        isListening ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                      }`}
                      value={form.details}
                      onChange={e => setForm({...form, details: e.target.value})}
                    ></textarea>
                    {isListening && (
                      <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                        يستمع... تحدث الآن
                      </p>
                    )}
                  </div>

                  {error && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mt-6">
                      {error}
                    </motion.div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsSavingTemplate(true)}
                      className="text-xs font-bold text-gray-600 hover:text-brown-600 flex items-center gap-1.5 transition-colors border border-gray-200 hover:border-brown-200 px-3 py-1.5 rounded-lg bg-white shadow-sm"
                    >
                      <Bookmark className="w-4 h-4" />
                      حفظ كقالب مخصص
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'branding' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      تفعيل الترويسة العلوية (Header)
                    </label>
                    <input 
                      type="checkbox"
                      checked={branding.enableHeader}
                      onChange={e => setBranding(prev => ({ ...prev, enableHeader: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-brown-600 focus:ring-brown-500 transition-colors"
                    />
                  </div>

                  {branding.enableHeader && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 p-4 border border-gray-100 bg-gray-50/50 rounded-xl overflow-hidden">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 block">شكل وتصميم الترويسة (Theme)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'classic', label: 'كلاسيكي' },
                            { id: 'modern', label: 'حديث' },
                            { id: 'creative', label: 'إبداعي' }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setBranding(prev => ({ ...prev, theme: t.id }))}
                              className={`py-2 text-xs font-bold rounded-lg transition-all border ${
                                branding.theme === t.id 
                                  ? 'bg-brown-600 text-white border-brown-600 shadow-md' 
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-brown-300 hover:bg-gray-50'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500">اسم الجهة / الشركة</label>
                        <input 
                          type="text"
                          placeholder="مثال: شركة التقنية الحديثة"
                          value={branding.companyName}
                          onChange={e => setBranding(prev => ({ ...prev, companyName: e.target.value }))}
                          className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500">تفاصيل التواصل والعنوان (سطور متعددة)</label>
                        <textarea 
                          rows={3}
                          placeholder="مثال:&#10;الرياض، المملكة العربية السعودية&#10;هاتف: 920000000&#10;info@company.com"
                          value={branding.companyDetails}
                          onChange={e => setBranding(prev => ({ ...prev, companyDetails: e.target.value }))}
                          className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 block">شعار الجهة (Logo)</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => handleImageUpload(e, 'logo')}
                          className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-brown-50 file:text-brown-700 hover:file:bg-brown-100"
                        />
                        {branding.logoUrl && (
                          <div className="relative mt-2 inline-block">
                            <img src={branding.logoUrl} alt="Logo preview" className="max-h-16 rounded border border-gray-200 bg-white" />
                            <button 
                              type="button"
                              onClick={() => setBranding(prev => ({ ...prev, logoUrl: '' }))}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <hr className="border-gray-100 my-4 border-dashed" />

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      تفعيل التذييل السفلي (Footer)
                    </label>
                    <input 
                      type="checkbox"
                      checked={branding.enableFooter}
                      onChange={e => setBranding(prev => ({ ...prev, enableFooter: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-brown-600 focus:ring-brown-500 transition-colors"
                    />
                  </div>

                  {branding.enableFooter && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 p-4 border border-gray-100 bg-gray-50/50 rounded-xl">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500">نص التذييل (الهامش السفلي)</label>
                        <input 
                          type="text"
                          placeholder="مثال: هذا الخطاب سري وخاص بالجهة المرسل إليها."
                          value={branding.footerText}
                          onChange={e => setBranding(prev => ({ ...prev, footerText: e.target.value }))}
                          className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {activeSection === 'signature' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-gray-800 block mb-2">التوقيع الإلكتروني</label>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setIsSigningOpen(true)}
                        className="flex-1 bg-brown-50 border border-brown-200 text-brown-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-brown-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <PenLine className="w-4 h-4" />
                        رسم توقيع باليد
                      </button>
                      <input 
                        type="file" 
                        id="sig-upload"
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'signature')}
                        className="hidden"
                      />
                      <label 
                        htmlFor="sig-upload"
                        className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
                      >
                        <Download className="w-4 h-4 rotate-180" />
                        رفع صورة توقيع
                      </label>
                    </div>
                    
                    {signatureImage && (
                      <div className="relative mt-3 inline-block bg-gray-50 p-2 rounded border border-gray-200">
                        <img src={signatureImage} alt="Signature preview" className="max-h-16 object-contain bg-white" />
                        <button 
                          type="button"
                          onClick={() => setSignatureImage(null)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <hr className="border-gray-100 my-4 border-dashed" />

                  <div>
                    <label className="text-sm font-bold text-gray-800 block mb-2">الختم الرسمي / الشعار المائي</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleImageUpload(e, 'seal')}
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-brown-50 file:text-brown-700 hover:file:bg-brown-100"
                    />
                    {sealImage && (
                      <div className="relative mt-3 inline-block bg-gray-50 p-2 rounded border border-gray-200">
                        <img src={sealImage} alt="Seal preview" className="max-h-16 object-contain bg-white" />
                        <button 
                          type="button"
                          onClick={() => setSealImage(null)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>

          {/* Dynamic Variables Panel */}
          {currentVariables.length > 0 && (
            <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-6 bg-brown-50/50 border border-brown-100 rounded-xl p-4">
              <h3 className="text-sm font-bold text-brown-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brown-600" />
                المتغيرات الذكية (املأ الفراغات)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentVariables.map(variable => (
                  <div key={variable} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-brown-700">{variable}</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        id={`var_${variable}`}
                        placeholder={`أدخل ${variable}`}
                        className="w-full rounded-lg border-brown-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(`var_${variable}`) as HTMLInputElement;
                          if(input) replaceVariable(variable, input.value);
                        }}
                        className="bg-brown-600 text-white px-3 rounded-lg text-xs font-bold hover:bg-brown-700"
                      >
                        تطبيق
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Save Template Modal Inside Form Column */}
          <AnimatePresence>
            {isSavingTemplate && (
              <motion.div 
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: 10}}
                className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-lg absolute bottom-12 left-6 right-6 z-20"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900">تسمية القالب المخصص</h4>
                  <button type="button" onClick={() => setIsSavingTemplate(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="مثال: طلب إجازة خاصة"
                    className="flex-1 rounded-lg border-gray-200 border px-3 py-2 text-sm outline-none focus:border-brown-500"
                    value={newTemplateName}
                    onChange={e => setNewTemplateName(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleSaveCustomTemplate}
                    disabled={!newTemplateName}
                    className="bg-brown-600 text-white px-4 rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    حفظ
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-2xl border border-brown-100/60 min-h-[600px] flex flex-col relative overflow-hidden">
          {/* top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{background: 'linear-gradient(90deg, #f9883a, #e86c1a, #c8520d)'}} />

          <div className="flex flex-col h-full relative z-10 p-8 sm:p-10">
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100 flex-wrap gap-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                الخطاب الناتج
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center border border-gray-200 bg-white rounded-md shadow-sm mr-2 h-[34px]">
                  <button 
                    onClick={handleUndo}
                    disabled={historyIndex < 0}
                    type="button"
                    className="px-2 h-full text-gray-500 hover:text-brown-600 hover:bg-gray-50 rounded-r-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-l border-gray-100 flex items-center justify-center"
                    title="تراجع"
                  >
                    <UndoIcon className="w-4 h-4 rtl:-scale-x-100" />
                  </button>
                  <button 
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    type="button"
                    className="px-2 h-full text-gray-500 hover:text-brown-600 hover:bg-gray-50 rounded-l-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title="إعادة"
                  >
                    <RedoIcon className="w-4 h-4 rtl:-scale-x-100" />
                  </button>
                </div>
                <button 
                  onClick={() => setIsAiModalOpen(true)}
                  disabled={!generatedLetter}
                  className="text-xs font-bold text-white bg-brown-600 hover:bg-brown-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-2 rounded shadow-sm transition-all"
                  title="المساعد الذكي: صياغة، تدقيق، وتحليل النبرة"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  مساعد الذكاء الاصطناعي 🤖
                </button>
                <button 
                  onClick={handleSaveDraft}
                  className="text-xs font-semibold text-gray-600 hover:text-brown-600 flex items-center gap-1.5 px-3 py-2 rounded border border-gray-200 hover:border-brown-200 hover:bg-brown-50 bg-white transition-all shadow-sm"
                >
                  {draftStatus ? <Check className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4" />}
                  {draftStatus ? 'تم الحفظ' : 'حفظ كمسودة (مؤقتاً)'}
                </button>
                {/* Tags + Save button group */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Pending tags */}
                  {pendingTags.map(tag => (
                    <span key={tag} className="flex items-center gap-0.5 bg-brown-100 text-brown-700 text-[10px] font-bold px-2 py-1.5 rounded-sm">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setPendingTags(prev => prev.filter(t => t !== tag))}
                        className="hover:text-red-500 mr-0.5 transition-colors"
                      >×</button>
                    </span>
                  ))}
                  {/* Tag input */}
                  <input
                    type="text"
                    placeholder="+ وسم"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if ((e.key === 'Enter' || e.key === ' ') && tagInput.trim()) {
                        e.preventDefault();
                        const newTag = tagInput.trim().replace(/\s+/g, '-');
                        if (!pendingTags.includes(newTag)) setPendingTags(prev => [...prev, newTag]);
                        setTagInput('');
                      }
                    }}
                    className="text-xs px-2 py-1.5 outline-none bg-transparent w-14 placeholder-gray-400 min-w-0"
                  />
                  <button 
                    onClick={handleSave}
                    disabled={!generatedLetter}
                    className="text-xs font-semibold text-gray-600 hover:text-brown-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-2 border-r border-gray-200 hover:bg-brown-50 transition-all"
                  >
                    {savedStatus ? <Check className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4" />}
                    {savedStatus ? 'تم الحفظ' : 'حفظ'}
                  </button>
                </div>
                <button 
                  onClick={handleCopy}
                  disabled={!generatedLetter}
                  className="text-xs font-semibold text-gray-600 hover:text-brown-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-2 rounded border border-gray-200 hover:border-brown-200 hover:bg-brown-50 bg-white transition-all shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'تم النسخ' : 'نسخ'}
                </button>
                <button 
                  onClick={handleExportDOCX}
                  disabled={!generatedLetter}
                  className="text-xs font-semibold text-gray-600 hover:text-brown-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-2 rounded border border-gray-200 hover:border-brown-200 hover:bg-brown-50 bg-white transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  تحميل Word
                </button>
                <button 
                  onClick={handleExportPDF}
                  disabled={!generatedLetter}
                  className="text-xs font-semibold text-gray-600 hover:text-brown-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-2 rounded border border-gray-200 hover:border-brown-200 hover:bg-brown-50 bg-white transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  تحميل PDF
                </button>
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  disabled={!generatedLetter}
                  className="text-xs font-semibold text-gray-600 hover:text-brown-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-2 rounded border border-gray-200 hover:border-brown-200 hover:bg-brown-50 bg-white transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  مشاركة برابط آمن
                </button>
                {/* WhatsApp Direct Share */}
                <a
                  href={generatedLetter ? `https://api.whatsapp.com/send?text=${encodeURIComponent((form.subject ? form.subject + ':\n\n' : '') + generatedLetter)}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => !generatedLetter && e.preventDefault()}
                  className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded border transition-all shadow-sm ${
                    generatedLetter
                      ? 'text-green-700 border-green-200 hover:bg-green-50 bg-white hover:border-green-400'
                      : 'text-gray-400 border-gray-200 bg-white opacity-50 cursor-not-allowed'
                  }`}
                  title="مشاركة الخطاب مباشرة عبر واتساب"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  واتساب
                </a>
                <button 
                  onClick={() => setIsEmailModalOpen(true)}
                  disabled={!generatedLetter}
                  className="text-xs font-semibold text-gray-600 hover:text-brown-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-2 rounded border border-gray-200 hover:border-brown-200 hover:bg-brown-50 bg-white transition-all shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  مشاركة عبر الإيميل
                </button>
              </div>
            </div>

            {generatedLetter && !loading && (
              <div className="flex items-center gap-4 bg-gray-50/80 p-3 rounded-lg border border-gray-100 mb-6">
                <div className="flex items-center gap-2 relative z-20">
                  <label className="text-xs font-bold text-gray-500">الخط:</label>
                  <div className="w-48">
                    <CustomSelect 
                      value={fontFamily}
                      onChange={val => setFontFamily(val)}
                      options={fontFamilies}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-20">
                  <label className="text-xs font-bold text-gray-500">حجم النص:</label>
                  <div className="w-36">
                    <CustomSelect 
                      value={fontSize}
                      onChange={val => setFontSize(val)}
                      options={fontSizes}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Word / Char Counter */}
            {generatedLetter && !loading && (
              <div className="flex items-center gap-4 mb-3 text-[11px] font-semibold text-gray-400">
                <span>{wordCount.toLocaleString('ar-EG')} كلمة</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 inline-block"></span>
                <span>{charCount.toLocaleString('ar-EG')} حرف</span>
                <span className={`mr-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  wordCount > 500 ? 'bg-red-50 text-red-600' :
                  wordCount > 300 ? 'bg-amber-50 text-amber-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  {wordCount > 500 ? 'خطاب طويل جداً' : wordCount > 300 ? 'خطاب طويل' : 'طول مناسب'}
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto relative flex flex-col justify-between p-4 border border-brown-100/50 rounded-xl bg-white/50">
              {/* Header inside Preview */}
              {generatedLetter && !loading && !isProofreading && branding.enableHeader && (
                <div className={`mb-8 ${
                  branding.theme === 'classic' 
                    ? 'border-b-2 border-brown-200 pb-6 flex flex-col items-center text-center gap-3' 
                    : branding.theme === 'creative'
                    ? `bg-brown-50/50 p-6 rounded-2xl border border-brown-100 flex items-center justify-between ${form.language === 'en' ? 'flex-row' : 'flex-row-reverse'}`
                    : `border-b-4 border-brown-600 pb-4 flex items-end justify-between ${form.language === 'en' ? 'flex-row' : 'flex-row-reverse'}`
                }`} dir={form.language === 'en' ? 'ltr' : 'rtl'}>
                  
                  {branding.theme === 'classic' ? (
                    <>
                      {branding.logoUrl && <img src={branding.logoUrl} alt="Logo" className="max-h-20 max-w-[150px] object-contain mb-2" />}
                      <h3 className="font-bold text-xl text-brown-900" style={{ fontFamily }}>{branding.companyName || 'اسم الجهة/المؤسسة'}</h3>
                      <p className="text-sm text-gray-500 whitespace-pre-line" style={{ fontFamily }}>{branding.companyDetails}</p>
                    </>
                  ) : (
                    <>
                      <div className={form.language === 'en' ? 'text-left' : 'text-right'}>
                        <h3 className="font-bold text-xl text-brown-900 mb-1" style={{ fontFamily }}>{branding.companyName || 'اسم الجهة/المؤسسة'}</h3>
                        <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed" style={{ fontFamily }}>{branding.companyDetails}</p>
                      </div>
                      {branding.logoUrl && (
                        <img src={branding.logoUrl} alt="Logo" className="max-h-16 max-w-[140px] object-contain shrink-0" />
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                  {loading || isProofreading ? (
                    <motion.div 
                      key="loading"
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      exit={{opacity: 0}}
                      className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3"
                    >
                      <Loader2 className="w-8 h-8 animate-spin text-brown-400" />
                      <p className="text-sm font-bold">{isProofreading ? 'نقوم بالتدقيق النحوي والإملائي...' : 'نقوم بالصياغة...'}</p>
                    </motion.div>
                  ) : generatedLetter ? (
                    <div className="space-y-6">
                      {/* Document Subject Header */}
                      <h2 className="text-center text-xl font-bold text-gray-900" style={{ fontFamily }}>{form.subject}</h2>
                      
                      <motion.textarea 
                        key="content"
                        ref={textareaRef}
                        value={generatedLetter}
                        onChange={(e) => {
                          updateLetterContent(e.target.value, true);
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        spellCheck={true}
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        className={`w-full min-h-[400px] resize-none bg-transparent outline-none border-2 border-transparent focus:border-brown-100 rounded-lg p-2 -mx-2 transition-all text-gray-800 leading-relaxed font-medium ${form.language === 'en' ? 'text-left' : 'text-right'}`}
                        dir={form.language === 'en' ? 'ltr' : 'rtl'}
                        style={{ fontFamily, fontSize }}
                      />
                    </div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="flex flex-col items-center justify-center text-gray-400 gap-5 h-full min-h-[300px] my-auto"
                    >
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 rounded-full border-2 border-gray-100 bg-gray-50 flex items-center justify-center mb-2 shadow-sm relative"
                      >
                         <FileText className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
                      </motion.div>
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="text-xl md:text-2xl font-bold text-gray-500 leading-loose pb-1"
                      >
                        لا يوجد خطاب بعد
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="text-sm md:text-base text-center text-gray-500 max-w-md leading-relaxed pb-1"
                      >
                        املأ التفاصيل واضغط على زر الإنشاء لتحصل على صياغة رسمية جاهزة للاستخدام.
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Signatures/Stamps in Preview */}
              {generatedLetter && !loading && !isProofreading && (signatureImage || sealImage) && (
                <div className={`mt-8 pt-4 flex gap-8 items-center ${form.language === 'en' ? 'justify-start' : 'justify-end'}`} dir={form.language === 'en' ? 'ltr' : 'rtl'}>
                  <div className="text-center">
                    <p className="text-xs font-bold text-brown-900 mb-2" style={{ fontFamily }}>التوقيع والختم:</p>
                    <div className="flex gap-4 items-center justify-center h-20">
                      {signatureImage && (
                        <img src={signatureImage} alt="Signature" className="max-h-16 max-w-[100px] object-contain" />
                      )}
                      {sealImage && (
                        <img src={sealImage} alt="Seal/Stamp" className="max-h-16 max-w-[80px] object-contain" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer in Preview */}
              {generatedLetter && !loading && !isProofreading && branding.enableFooter && (
                <div className="border-t border-gray-100 pt-4 mt-8 text-center text-xs text-brown-500/80" style={{ fontFamily }}>
                  {branding.footerText || 'التذييل السفلي'}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Archive Slide-over */}
        <AnimatePresence>
          {isArchiveOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsArchiveOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
              >
                <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brown-100 rounded-lg flex items-center justify-center text-brown-600">
                      <Archive className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-900">الأرشيف المحلي</h3>
                  </div>
                  <button 
                    onClick={() => setIsArchiveOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 border-b border-gray-100 bg-white flex flex-col gap-3 shrink-0">
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setArchiveTab('all')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${archiveTab === 'all' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                    >
                      الكل
                    </button>
                    <button 
                      onClick={() => setArchiveTab('saved')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${archiveTab === 'saved' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                    >
                      مكتملة
                    </button>
                    <button 
                      onClick={() => setArchiveTab('drafts')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${archiveTab === 'drafts' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                    >
                      مسودات
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="ابحث في الخطابات..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brown-500/20 focus:border-brown-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 relative z-30">
                    <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="flex-1">
                      <CustomSelect 
                        value={filterType}
                        onChange={val => setFilterType(val)}
                        options={[
                          { value: 'all', label: 'جميع الأنواع' },
                          ...ObjectKeys.map(type => ({ value: type, label: type }))
                        ]}
                      />
                    </div>
                  </div>
                  {/* Tags filter */}
                  {(() => {
                    const archiveTags = Array.from(new Set(savedLetters.flatMap(l => l.tags || [])));
                    return archiveTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <button
                          onClick={() => setFilterTag('')}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                            filterTag === '' ? 'bg-brown-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >كل الوسوم</button>
                        {archiveTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              filterTag === tag ? 'bg-brown-600 text-white' : 'bg-brown-50 text-brown-700 hover:bg-brown-100'
                            }`}
                          >#{tag}</button>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredLetters.length === 0 ? (
                    <div className="text-center text-gray-400 mt-20">
                      <Archive className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">لا توجد خطابات مطابقة</p>
                    </div>
                  ) : (
                    filteredLetters.map(letter => (
                      <div 
                        key={letter.id}
                        onClick={() => handleLoadSaved(letter)}
                        className={`bg-white border ${
                          letter.isPinned
                            ? 'border-brown-300 ring-1 ring-brown-200/60'
                            : letter.isDraft
                            ? 'border-dashed border-yellow-300 bg-yellow-50/30 hover:border-yellow-500'
                            : 'border-gray-200 hover:border-brown-300'
                        } p-4 rounded-xl cursor-pointer hover:shadow-md transition-all group relative`}
                      >
                        {/* Pin Button */}
                        <button
                          type="button"
                          onClick={e => handleTogglePin(e, letter.id)}
                          className={`absolute top-3 left-3 p-1 rounded-md transition-all ${
                            letter.isPinned
                              ? 'text-brown-600 bg-brown-50 opacity-100'
                              : 'text-gray-300 hover:text-brown-500 hover:bg-brown-50 opacity-0 group-hover:opacity-100'
                          }`}
                          title={letter.isPinned ? 'إلغاء التثبيت' : 'تثبيت الخطاب'}
                        >
                          {letter.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>

                        <h4 className="font-bold text-gray-800 text-sm mb-2 group-hover:text-brown-600 transition-colors pr-2">{letter.subject}</h4>
                        <div className="flex gap-2 items-center mb-2">
                          {letter.isPinned && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-brown-50 text-brown-600 border border-brown-200">
                              📌 مثبت
                            </span>
                          )}
                          {letter.type && (
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${letter.isDraft ? 'bg-yellow-100/50 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                              {letter.type}
                            </span>
                          )}
                          {letter.isDraft && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                              مسودة مؤقتة
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {letter.content || letter.formData?.details || '(بدون محتوى)'}
                          </p>
                          {/* Tags */}
                          {letter.tags && letter.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {letter.tags.map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={e => { e.stopPropagation(); setFilterTag(filterTag === tag ? '' : tag); }}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                    filterTag === tag
                                      ? 'bg-brown-600 text-white'
                                      : 'bg-brown-50 text-brown-600 hover:bg-brown-100'
                                  }`}
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
                            <Clock className="w-3 h-3" />
                            {letter.date}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Email Modal */}
        <AnimatePresence>
          {isEmailModalOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEmailModalOpen(false)}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-brown-600" />
                      إرسال عبر البريد الإلكتروني
                    </h3>
                    <button 
                      onClick={() => setIsEmailModalOpen(false)}
                      className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {emailSuccess ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 text-sm font-medium leading-relaxed">
                      {emailSuccess.includes('Ethereal') ? (
                        <>
                          تم الإرسال بنجاح (بيئة تجريبية).<br />
                          <a href={emailSuccess.split('رابط المعاينة: ')[1]} target="_blank" rel="noopener noreferrer" className="underline font-bold text-green-800">
                            اضغط هنا لمعاينة الرسالة
                          </a>
                        </>
                      ) : (
                        emailSuccess
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-gray-800 block mb-1.5">البريد الإلكتروني للمرسل إليه</label>
                        <input 
                          type="email"
                          placeholder="example@domain.com"
                          value={emailForm.to}
                          onChange={e => setEmailForm({...emailForm, to: e.target.value})}
                          className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-800 block mb-1.5">موضوع الرسالة</label>
                        <input 
                          type="text"
                          value={emailForm.subject}
                          onChange={e => setEmailForm({...emailForm, subject: e.target.value})}
                          className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer pt-2 group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox"
                            checked={emailForm.attachPdf}
                            onChange={e => setEmailForm({...emailForm, attachPdf: e.target.checked})}
                            className="w-5 h-5 border-2 border-gray-300 rounded text-brown-600 focus:ring-brown-500 cursor-pointer form-checkbox transition-colors"
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 select-none group-hover:text-gray-900 transition-colors">
                          إرفاق الخطاب كـ PDF
                        </span>
                      </label>

                      <button 
                        onClick={handleSendEmail}
                        disabled={isSendingEmail || !emailForm.to || !emailForm.subject}
                        className="w-full mt-2 bg-brown-600 hover:bg-brown-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brown-200"
                      >
                        {isSendingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:-scale-x-100" />}
                        {isSendingEmail ? 'جاري الإرسال...' : 'إرسال'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Template Library Modal */}
        <AnimatePresence>
          {isLibraryOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLibraryOpen(false)}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                className="fixed top-0 left-0 bottom-0 w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl bg-gray-50 shadow-2xl z-50 flex flex-col overflow-hidden border-r border-gray-200"
              >
                <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brown-100 rounded-xl flex items-center justify-center text-brown-600">
                      <Library className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">مكتبة القوالب</h3>
                      <p className="text-xs text-gray-500">اختر قالباً جاهزاً أو من قوالبك المخصصة</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsLibraryOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex border-b border-gray-200 bg-white px-4 shrink-0">
                  <button
                    className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors ${libraryTab === 'system' ? 'border-brown-600 text-brown-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setLibraryTab('system')}
                  >
                    القوالب الجاهزة
                  </button>
                  <button
                    className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${libraryTab === 'custom' ? 'border-brown-600 text-brown-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setLibraryTab('custom')}
                  >
                    قوالبي المخصصة
                    {customTemplates.length > 0 && (
                      <span className="bg-brown-100 text-brown-800 text-[10px] px-2 py-0.5 rounded-full">{customTemplates.length}</span>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  {libraryTab === 'system' ? (
                    <div className="space-y-8">
                      {favoritePredefined.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-sm font-bold text-yellow-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-yellow-400 rounded-full inline-block"></span>
                            المفضلة
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {predefinedTemplates.filter(t => favoritePredefined.includes(t.id)).map(template => (
                              <div
                                key={template.id}
                                className={`bg-white p-4 rounded-xl border transition-all cursor-pointer group flex items-start gap-3.5 relative ${
                                  activeTemplate === template.id
                                    ? 'border-brown-500 shadow-md ring-1 ring-brown-500/20'
                                    : 'border-gray-200 hover:border-brown-300 hover:shadow-sm'
                                }`}
                                onClick={() => applyTemplate(template.id, false)}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavoritePredefined(template.id, e)}
                                  className="absolute top-2 left-2 p-1 text-yellow-400 hover:text-yellow-500 transition-colors bg-white/80 rounded-full"
                                  title="إزالة من المفضلة"
                                >
                                  <Star className="w-4 h-4 fill-yellow-400" />
                                </button>
                                <div className={`p-2.5 rounded-xl shrink-0 transition-all ${activeTemplate === template.id ? 'bg-brown-50 text-brown-600' : 'bg-gray-50 text-gray-500 group-hover:bg-brown-50 group-hover:text-brown-500'}`}>
                                  {template.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-sm text-gray-800 group-hover:text-brown-600 transition-colors mb-1 ml-6">{template.name}</h5>
                                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{template.data.subject || template.data.details}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {Array.from(new Set(predefinedTemplates.map(t => t.category))).map(category => (
                        <div key={category}>
                          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-brown-300 rounded-full inline-block"></span>
                            {category}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {predefinedTemplates.filter(t => t.category === category).map(template => (
                              <div
                                key={template.id}
                                className={`bg-white p-4 rounded-xl border transition-all cursor-pointer group flex items-start gap-3.5 relative ${
                                  activeTemplate === template.id
                                    ? 'border-brown-500 shadow-md ring-1 ring-brown-500/20'
                                    : 'border-gray-200 hover:border-brown-300 hover:shadow-sm'
                                }`}
                                onClick={() => applyTemplate(template.id, false)}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavoritePredefined(template.id, e)}
                                  className={`absolute top-2 left-2 p-1 transition-colors bg-white/80 rounded-full ${favoritePredefined.includes(template.id) ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                                  title={favoritePredefined.includes(template.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                                >
                                  <Star className={`w-4 h-4 ${favoritePredefined.includes(template.id) ? 'fill-yellow-400' : ''}`} />
                                </button>
                                <div className={`p-2.5 rounded-xl shrink-0 transition-all ${activeTemplate === template.id ? 'bg-brown-50 text-brown-600' : 'bg-gray-50 text-gray-500 group-hover:bg-brown-50 group-hover:text-brown-500'}`}>
                                  {template.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-sm text-gray-800 group-hover:text-brown-600 transition-colors mb-1 ml-6">{template.name}</h5>
                                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{template.data.subject || template.data.details}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {customTemplates.length === 0 ? (
                        <div className="text-center text-gray-400 mt-20">
                          <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm font-bold text-gray-600">لا توجد قوالب مخصصة</p>
                          <p className="text-xs mt-2">يمكنك حفظ أي خطاب تقوم بإعداده كقالب مخصص لاستخدامه لاحقاً.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {customTemplates.map(template => (
                            <div
                              key={template.id}
                              className={`bg-white p-4 rounded-xl border transition-all cursor-pointer group flex items-center justify-between gap-4 ${
                                activeTemplate === template.id
                                  ? 'border-brown-500 shadow-md ring-1 ring-brown-500/20'
                                  : 'border-gray-200 hover:border-brown-300 hover:shadow-sm'
                              }`}
                              onClick={() => applyTemplate(template.id, true)}
                            >
                              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                <div className="p-2.5 rounded-xl bg-brown-50 text-brown-600 shrink-0">
                                  <Bookmark className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0 text-right">
                                  <h5 className="font-bold text-sm text-gray-800 group-hover:text-brown-600 transition-colors mb-1">{template.name}</h5>
                                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{template.data.subject}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = customTemplates.filter(t => t.id !== template.id);
                                  setCustomTemplates(updated);
                                  localStorage.setItem('custom_templates', JSON.stringify(updated));
                                }}
                                className="text-gray-400 hover:text-red-500 p-1.5 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                title="حذف القالب"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Signature Drawing Modal */}
        <AnimatePresence>
          {isSigningOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSigningOpen(false)}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <PenLine className="w-5 h-5 text-brown-600" />
                      رسم توقيعك الإلكتروني
                    </h3>
                    <button 
                      onClick={() => setIsSigningOpen(false)}
                      className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    <canvas 
                      ref={canvasRef}
                      width={400}
                      height={200}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="cursor-crosshair bg-white"
                    />
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <button 
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                    >
                      مسح لوحة الرسم
                    </button>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setIsSigningOpen(false)}
                        className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg transition-colors border border-gray-200"
                      >
                        إلغاء
                      </button>
                      <button 
                        type="button"
                        onClick={saveSignature}
                        className="text-xs font-bold bg-brown-600 hover:bg-brown-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        حفظ التوقيع
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* OCR Image Scan Modal */}
        <AnimatePresence>
          {isOcrOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOcrOpen(false)}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-brown-600" />
                      واجهة استخراج النصوص (OCR)
                    </h3>
                    <button 
                      onClick={() => setIsOcrOpen(false)}
                      className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      قم بتصوير أو رفع صورة لخطاب رسمي ورقي قديم، وسيقوم الذكاء الاصطناعي باستخراج النص بالكامل لتتمكن من التعديل عليه وإعادة استخدامه.
                    </p>

                    <div className="border-2 border-dashed border-gray-200 hover:border-brown-400 rounded-xl p-8 text-center bg-gray-50/50 transition-colors relative cursor-pointer group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleOcrUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        disabled={ocrLoading}
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        {ocrLoading ? (
                          <Loader2 className="w-10 h-10 animate-spin text-brown-600" />
                        ) : (
                          <Upload className="w-10 h-10 text-gray-400 group-hover:text-brown-500 transition-colors" />
                        )}
                        <span className="text-sm font-bold text-gray-700">
                          {ocrLoading ? 'جاري استخراج النصوص...' : 'اختر صورة الخطاب أو اسحبها هنا'}
                        </span>
                        <span className="text-xs text-gray-400">يدعم صيغ JPG, PNG, WEBP</span>
                      </div>
                    </div>

                    {ocrError && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100">
                        {ocrError}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button 
                      type="button"
                      onClick={() => setIsOcrOpen(false)}
                      disabled={ocrLoading}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Secure Share Modal */}
        <AnimatePresence>
          {isShareModalOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsShareModalOpen(false);
                  setShareUrl('');
                  setSharePassword('');
                }}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Send className="w-5 h-5 text-brown-600" />
                      مشاركة الخطاب برابط آمن
                    </h3>
                    <button 
                      onClick={() => {
                        setIsShareModalOpen(false);
                        setShareUrl('');
                        setSharePassword('');
                      }}
                      className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      سيتم توليد رابط مؤقت (صالح لمدة 24 ساعة) يتيح لمن يملكه استعراض الخطاب الرسمي وقراءته بطريقة منسقة وتصديره لـ PDF.
                    </p>

                    {!shareUrl ? (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 block">كلمة مرور لحماية الرابط (اختياري)</label>
                          <input 
                            type="password" 
                            placeholder="أدخل كلمة مرور (مثال: 1234)"
                            value={sharePassword}
                            onChange={e => setSharePassword(e.target.value)}
                            className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateShareLink}
                          disabled={shareLoading}
                          className="w-full bg-brown-600 hover:bg-brown-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        >
                          {shareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          إنشاء رابط المشاركة المؤقت
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 text-xs font-bold">
                          تم إنشاء رابط المعاينة الآمن بنجاح!
                        </div>
                        
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            readOnly 
                            value={shareUrl}
                            className="flex-1 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600 outline-none text-left select-all font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(shareUrl);
                              setShareCopied(true);
                              setTimeout(() => setShareCopied(false), 2000);
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 rounded-xl text-xs font-bold transition-all border border-gray-200 flex items-center justify-center gap-1 min-w-[80px]"
                          >
                            {shareCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {shareCopied ? 'تم!' : 'نسخ'}
                          </button>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <a 
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent('معاينة الخطاب الرسمي: ' + shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            مشاركة عبر WhatsApp
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setShareUrl('');
                              setSharePassword('');
                            }}
                            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            رابط جديد
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
