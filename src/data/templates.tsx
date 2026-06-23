import React from 'react';
import { Building2, Briefcase, AlertCircle, MessageSquare, FileText, User, Heart, Sparkles, Calendar, Mail } from 'lucide-react';

export const letterTypes = {
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

export const getLetterTypeData = (type: string) => {
  if (type === 'إداري/رسمي') return letterTypes['إداري/رسمي'];
  if (type === 'أعمال') return letterTypes['أعمال'];
  if (type === 'شخصي') return letterTypes['شخصي'];
  return letterTypes['إداري/رسمي'];
};

export const toneOptions = ['رسمي', 'مهني جداً', 'ودود', 'حماسي', 'إقناعي', 'حازم'];
export const formalityOptions = ['رسمي جداً', 'رسمي', 'شبه رسمي', 'ودي (غير رسمي)'];

export const predefinedTemplates = [
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

export const fontFamilies = [
  { label: 'كايرو (Cairo)', value: 'Cairo' },
  { label: 'أميري (Amiri)', value: 'Amiri' },
  { label: 'تجوّال (Tajawal)', value: 'Tajawal' },
  { label: 'ترادشنال أرابيك (Traditional Arabic)', value: 'Traditional Arabic, Amiri, serif' },
  { label: 'أريال (Arial)', value: 'Arial, sans-serif' }
];

export const fontSizes = [
  { label: 'صغير جداً (12px)', value: '12px' },
  { label: 'صغير (14px)', value: '14px' },
  { label: 'متوسط (15px)', value: '15px' },
  { label: 'كبير (16px)', value: '16px' },
  { label: 'كبير جداً (18px)', value: '18px' },
  { label: 'ضخم (20px)', value: '20px' }
];
