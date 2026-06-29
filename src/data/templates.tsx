import React from 'react';
import { Building2, Briefcase, AlertCircle, MessageSquare, FileText, User, Heart, Sparkles, Calendar, Mail, Scale, Stethoscope, GraduationCap } from 'lucide-react';

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
  },
  'توظيف وتطوير مهني': {
    icon: Briefcase,
    subTypes: [
      { name: 'خطاب تغطية (Cover Letter)', icon: FileText },
      { name: 'رسالة متابعة طلب توظيف', icon: Mail },
      { name: 'رسالة تواصل LinkedIn', icon: User },
      { name: 'رسالة شكر بعد المقابلة', icon: Heart },
      { name: 'رسالة قبول/اعتذار عن عرض عمل', icon: AlertCircle }
    ]
  },
  'قانوني': {
    icon: Scale,
    subTypes: [
      { name: 'خطاب إنذار قانوني', icon: AlertCircle },
      { name: 'خطاب مطالبة حقوقية', icon: FileText },
      { name: 'عقد/اتفاقية تقديم خدمات', icon: FileText },
      { name: 'أخرى', icon: FileText }
    ]
  },
  'طبي': {
    icon: Stethoscope,
    subTypes: [
      { name: 'خطاب تقرير طبي', icon: Heart },
      { name: 'خطاب إجازة مرضية', icon: Calendar },
      { name: 'طلب إحالة طبية', icon: FileText },
      { name: 'أخرى', icon: FileText }
    ]
  },
  'أكاديمي/تعليمي': {
    icon: GraduationCap,
    subTypes: [
      { name: 'خطاب طلب قبول جامعي', icon: Building2 },
      { name: 'خطاب توصية أكاديمية', icon: User },
      { name: 'طلب تأجيل دراسي', icon: Calendar },
      { name: 'أخرى', icon: FileText }
    ]
  }
};

export const getLetterTypeData = (type: string) => {
  if (type === 'إداري/رسمي') return letterTypes['إداري/رسمي'];
  if (type === 'أعمال') return letterTypes['أعمال'];
  if (type === 'شخصي') return letterTypes['شخصي'];
  if (type === 'توظيف وتطوير مهني') return letterTypes['توظيف وتطوير مهني'];
  if (type === 'قانوني') return letterTypes['قانوني'];
  if (type === 'طبي') return letterTypes['طبي'];
  if (type === 'أكاديمي/تعليمي') return letterTypes['أكاديمي/تعليمي'];
  return letterTypes['إداري/رسمي'];
};

export const toneOptions = ['رسمي', 'مهني جداً', 'ودود', 'حماسي', 'إقناعي', 'حازم'];
export const formalityOptions = ['رسمي جداً', 'رسمي', 'شبه رسمي', 'ودي (غير رسمي)'];

export const predefinedTemplates = [
  {
    id: 'cover_letter',
    category: 'توظيف وتطوير مهني',
    name: 'خطاب تغطية (Cover Letter)',
    icon: <FileText className="w-5 h-5" />,
    data: {
      type: 'توظيف وتطوير مهني',
      subType: 'خطاب تغطية (Cover Letter)',
      subject: 'طلب الانضمام لفريق عملكم المميز',
      details: 'أود التعبير عن اهتمامي الشديد بالانضمام لشركتكم المرموقة، وتجدون طيه تفاصيل خبراتي ومهاراتي المتوافقة مع متطلبات الوظيفة.',
      tone: 'مهني جداً',
      formality: 'رسمي'
    }
  },
  {
    id: 'linkedin_connect',
    category: 'توظيف وتطوير مهني',
    name: 'رسالة تواصل LinkedIn',
    icon: <User className="w-5 h-5" />,
    data: {
      type: 'توظيف وتطوير مهني',
      subType: 'رسالة تواصل LinkedIn',
      subject: 'طلب تواصل مهني',
      details: 'أهلاً بك، يشرفني التواصل معك لمتابعة مستجدات قطاع الأعمال والتعاون المهني المتبادل.',
      tone: 'ودود',
      formality: 'شبه رسمي'
    }
  },
  {
    id: 'interview_followup',
    category: 'توظيف وتطوير مهني',
    name: 'رسالة شكر بعد المقابلة',
    icon: <Heart className="w-5 h-5" />,
    data: {
      type: 'توظيف وتطوير مهني',
      subType: 'رسالة شكر بعد المقابلة',
      subject: 'شكر وتقدير على وقتكم الثمين في المقابلة الشخصية',
      details: 'سعدت جداً بمقابلتكم اليوم واستعراض تفاصيل الفرصة الوظيفية، وأتطلع قدماً لخطواتنا القادمة.',
      tone: 'حماسي',
      formality: 'رسمي'
    }
  },
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
  },
  {
    id: 'legal_warning',
    category: 'القطاع القانوني',
    name: 'إنذار قانوني رسمي',
    icon: <Scale className="w-5 h-5" />,
    data: {
      type: 'قانوني',
      subType: 'خطاب إنذار قانوني',
      subject: 'إشعار وإنذار قانوني بضرورة تسوية [الموضوع]',
      details: 'نوجه إليكم هذا الإنذار القانوني الرسمي بشأن عدم الالتزام بـ [البند أو الاتفاقية]، ونطالبكم بتسوية الأمر خلال [المدة] لتفادي اتخاذ الإجراءات القضائية.',
      tone: 'حازمة',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'legal_agreement',
    category: 'القطاع القانوني',
    name: 'عقد تقديم خدمات',
    icon: <FileText className="w-5 h-5" />,
    data: {
      type: 'قانوني',
      subType: 'عقد/اتفاقية تقديم خدمات',
      subject: 'اتفاقية تقديم خدمات استشارية ومهنية',
      details: 'تحدد هذه الاتفاقية الشروط والأحكام لتقديم خدمات [نوع الخدمات] بين الطرف الأول [المرسل] والطرف الثاني [الموجه إليه].',
      tone: 'رسمية ومهنية',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'sick_leave',
    category: 'القطاع الطبي',
    name: 'خطاب إجازة مرضية',
    icon: <Calendar className="w-5 h-5" />,
    data: {
      type: 'طبي',
      subType: 'خطاب إجازة مرضية',
      subject: 'تقرير إجازة مرضية وعذر طبي',
      details: 'نشهد نحن [اسم المستشفى/العيادة] بأن المريض [اسم المريض] يعاني من [الحالة الصحية] ويحتاج إلى فترة راحة وتقرير طبي مدته [عدد الأيام] أيام تبدأ من [التاريخ].',
      tone: 'رسمية ومهنية',
      formality: 'رسمي'
    }
  },
  {
    id: 'academic_recommendation',
    category: 'القطاع الأكاديمي',
    name: 'توصية أكاديمية',
    icon: <GraduationCap className="w-5 h-5" />,
    data: {
      type: 'أكاديمي/تعليمي',
      subType: 'خطاب توصية أكاديمية',
      subject: 'خطاب توصية أكاديمية للطالب [اسم الطالب]',
      details: 'يسعدني بصفتي [رتبتك الأكاديمية] أن أتقدم بهذه التوصية للطالب المتميز [اسم الطالب] للالتحاق ببرنامجكم الدراسي، نظراً لتميزه المعرفي وسلوكه الأكاديمي الرفيع.',
      tone: 'إقناعية',
      formality: 'رسمي'
    }
  },
  {
    id: 'academic_deferral',
    category: 'القطاع الأكاديمي',
    name: 'طلب تأجيل دراسي',
    icon: <Calendar className="w-5 h-5" />,
    data: {
      type: 'أكاديمي/تعليمي',
      subType: 'طلب تأجيل دراسي',
      subject: 'طلب تأجيل الدراسة للفصل الدراسي [اسم الفصل]',
      details: 'أتقدم لسيادتكم بطلبنا هذا للموافقة على تأجيل دراستي للفصل الدراسي [اسم الفصل] نظراً لظروفي الخاصة المتمثلة في [الظروف].',
      tone: 'رسمية ومهنية',
      formality: 'رسمي'
    }
  },
  {
    id: 'salary_increase',
    category: 'شركات خاصة',
    name: 'طلب زيادة راتب',
    icon: <Briefcase className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب طلب (وظيفة، إجازة، مساعدة)',
      subject: 'طلب إعادة النظر في الراتب والمزايا الوظيفية',
      details: 'أتقدم لسيادتكم بطلب مراجعة راتبي الحالي بما يتناسب مع زيادة المسؤوليات الموكلة إليّ وجهودي المستمرة في تحقيق أهداف الشركة.',
      tone: 'مهني جداً',
      formality: 'رسمي'
    }
  },
  {
    id: 'experience_certificate',
    category: 'شركات خاصة',
    name: 'طلب شهادة خبرة',
    icon: <FileText className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب طلب (وظيفة، إجازة، مساعدة)',
      subject: 'طلب إصدار شهادة خبرة وخدمة',
      details: 'أرجو التكرم بالموافقة على تزويدي بشهادة خبرة رسمية توضح مسمياتي الوظيفية وفترة عملي بالشركة، وذلك لاستكمال مسوغات شخصية.',
      tone: 'مهنية',
      formality: 'رسمي'
    }
  },
  {
    id: 'employee_appreciation',
    category: 'شركات خاصة',
    name: 'خطاب شكر للموظف المتميز',
    icon: <Heart className="w-5 h-5" />,
    data: {
      type: 'شخصي',
      subType: 'خطاب شكر',
      subject: 'خطاب شكر وتقدير للأداء المتميز والتفاني',
      details: 'يسر إدارة الشركة أن تعرب لك عن خالص الشكر والتقدير لجهودك الاستثنائية وتفانيك في العمل، مما كان له أثر كبير في نجاح الفريق.',
      tone: 'حماسي',
      formality: 'رسمي'
    }
  },
  {
    id: 'contract_termination',
    category: 'القطاع القانوني',
    name: 'إشعار بفسخ عقد',
    icon: <AlertCircle className="w-5 h-5" />,
    data: {
      type: 'قانوني',
      subType: 'أخرى',
      subject: 'إشعار رسمي بإنهاء وفسخ العقد المبرم',
      details: 'نحيطكم علماً برغبتنا في عدم تجديد أو فسخ العقد المبرم بيننا بتاريخ [التاريخ]، وذلك وفقاً للبند رقم [رقم البند] من شروط الاتفاقية.',
      tone: 'حازمة',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'medical_referral',
    category: 'القطاع الطبي',
    name: 'طلب إحالة طبية',
    icon: <FileText className="w-5 h-5" />,
    data: {
      type: 'طبي',
      subType: 'طلب إحالة طبية',
      subject: 'طلب إحالة طبية لمستشفى تخصصي',
      details: 'أرجو التكرم بالموافقة على إحالة المريض [اسم المريض] إلى مستشفى [اسم المستشفى] لمتابعة العلاج تحت إشراف طبيب استشاري تخصصي.',
      tone: 'رسمية ومهنية',
      formality: 'رسمي'
    }
  },
  {
    id: 'board_meeting',
    category: 'أعمال',
    name: 'دعوة لاجتماع مجلس إدارة',
    icon: <Calendar className="w-5 h-5" />,
    data: {
      type: 'أعمال',
      subType: 'أخرى',
      subject: 'دعوة لحضور اجتماع مجلس الإدارة رقم [رقم الاجتماع]',
      details: 'يسرنا دعوتكم لحضور اجتماع مجلس الإدارة القادم والمقرر عقده يوم [اليوم] في تمام الساعة [الوقت] بمقر الشركة، لمناقشة جدول الأعمال المرفق.',
      tone: 'رسمية ومهنية',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'tech_support',
    category: 'إداري/رسمي',
    name: 'طلب دعم فني / تقني',
    icon: <Briefcase className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'أخرى',
      subject: 'طلب صيانة ودعم فني طارئ لأنظمة [اسم النظام]',
      details: 'نأمل التكرم بتوجيه فريق الدعم الفني لإصلاح العطل التقني المفاجئ في أنظمة الشبكة الداخلية لضمان استمرارية سير العمل دون انقطاع.',
      tone: 'رسمية ومهنية',
      formality: 'رسمي'
    }
  },
  {
    id: 'employee_clearance',
    category: 'شركات خاصة',
    name: 'خطاب إخلاء طرف',
    icon: <User className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'أخرى',
      subject: 'شهادة إخلاء طرف وبراءة ذمة للموظف',
      details: 'تشهد الشركة بأن الموظف/ة [الاسم] قد أنهى علاقته التعاقدية وتم إخلاء طرفه وتسليم كافة العهد المالية والعينية التي بحوزته بنجاح.',
      tone: 'رسمية ومهنية',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'official_inquiry',
    category: 'جهات حكومية',
    name: 'طلب استفسار رسمي',
    icon: <MessageSquare className="w-5 h-5" />,
    data: {
      type: 'إداري/رسمي',
      subType: 'خطاب استفسار',
      subject: 'طلب استفسار بشأن معاملة رقم [رقم المعاملة]',
      details: 'نتوجه إليكم بطلبنا هذا للإفادة والاستفسار عن حالة المعاملة الخاصة بنا المقيدة برقم [الرقم] وتاريخ [التاريخ]، لمعرفة الإجراء التالي المطلوب.',
      tone: 'رسمية ومهنية',
      formality: 'رسمي جداً'
    }
  },
  {
    id: 'legal_claim',
    category: 'القطاع القانوني',
    name: 'خطاب مطالبة حقوقية',
    icon: <Scale className="w-5 h-5" />,
    data: {
      type: 'قانوني',
      subType: 'خطاب مطالبة حقوقية',
      subject: 'مطالبة حقوقية ودية بسداد الالتزامات المالية المتأخرة',
      details: 'نطالبكم بموجب هذا الخطاب بالوفاء بالتزاماتكم المالية المتأخرة والبالغة [المبلغ] في موعد أقصاه [التاريخ] لتجنب اللجوء للمطالبة القضائية.',
      tone: 'حازمة',
      formality: 'رسمي جداً'
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

export const typeTranslations: Record<string, string> = {
  'إداري/رسمي': 'Administrative/Official',
  'أعمال': 'Business',
  'شخصي': 'Personal',
  'توظيف وتطوير مهني': 'Employment & Career',
  'قانوني': 'Legal',
  'طبي': 'Medical',
  'أكاديمي/تعليمي': 'Academic/Educational',
};

export const subTypeTranslations: Record<string, string> = {
  'خطاب طلب (وظيفة، إجازة، مساعدة)': 'Request Letter (Job, Leave, Assistance)',
  'خطاب شكوى (تظلم، إبلاغ عن مشكلة)': 'Complaint Letter (Grievance, Issue Reporting)',
  'خطاب استفسار': 'Inquiry Letter',
  'خطاب عرض سعر': 'Quotation Letter',
  'خطاب شراكة': 'Partnership Letter',
  'خطاب تعريف بالشركة': 'Company Profile Letter',
  'خطاب شكر': 'Thank You Letter',
  'خطاب اعتذار': 'Apology Letter',
  'خطاب تهنئة': 'Congratulation Letter',
  'خطاب تغطية (Cover Letter)': 'Cover Letter',
  'رسالة متابعة طلب توظيف': 'Job Application Follow-up',
  'رسالة تواصل LinkedIn': 'LinkedIn Networking Message',
  'رسالة شكر بعد المقابلة': 'Post-Interview Thank You',
  'رسالة قبول/اعتذار عن عرض عمل': 'Job Offer Response (Accept/Decline)',
  'خطاب إنذار قانوني': 'Legal Warning Letter',
  'خطاب مطالبة حقوقية': 'Legal Claim Letter',
  'عقد/اتفاقية تقديم خدمات': 'Service Agreement Contract',
  'خطاب تقرير طبي': 'Medical Report Letter',
  'خطاب إجازة مرضية': 'Sick Leave Certificate',
  'طلب إحالة طبية': 'Medical Referral Request',
  'خطاب طلب قبول جامعي': 'University Admission Request',
  'خطاب توصية أكاديمية': 'Academic Recommendation Letter',
  'طلب تأجيل دراسي': 'Academic Deferral Request',
  'أخرى': 'Other',
};

export const toneTranslations: Record<string, string> = {
  'رسمي': 'Official',
  'مهني جداً': 'Very Professional',
  'ودود': 'Friendly',
  'حماسي': 'Enthusiastic',
  'إقناعي': 'Persuasive',
  'حازم': 'Assertive',
  'رسمية ومهنية': 'Official & Professional',
  'مهنية': 'Professional',
  'حازمة': 'Assertive',
  'ودية': 'Friendly',
  'إقناعية': 'Persuasive',
};

export const formalityTranslations: Record<string, string> = {
  'رسمي جداً': 'Very Formal',
  'رسمي': 'Formal',
  'شبه رسمي': 'Semi-Formal',
  'ودي (غير رسمي)': 'Informal',
};

export const categoryTranslations: Record<string, string> = {
  'شركات خاصة': 'Private Companies',
  'جهات حكومية': 'Government Entities',
  'شخصي': 'Personal',
  'جامعات': 'Universities',
  'إداري/رسمي': 'Official/Administrative',
  'أعمال': 'Business',
  'توظيف وتطوير مهني': 'Employment & Career',
  'القطاع القانوني': 'Legal Sector',
  'القطاع الطبي': 'Medical Sector',
  'القطاع الأكاديمي': 'Academic Sector',
};

export const templateNameTranslations: Record<string, string> = {
  'طلب وظيفة': 'Job Application',
  'خطاب شكوى': 'Complaint Letter',
  'خطاب شكر': 'Thank You Letter',
  'طلب إجازة': 'Leave Request',
  'طلب استقالة': 'Resignation Request',
  'طلب قبول جامعي': 'University Admission Request',
  'طلب رعاية': 'Sponsorship Request',
  'دعوة رسمية': 'Official Invitation',
  'طلب ترقية': 'Promotion Request',
  'عرض سعر': 'Price Quotation',
  'خطاب تعريف بالشركة': 'Company Profile',
  'مطالبة مالية': 'Financial Claim',
  'طلب نقل': 'Transfer Request',
  'إنذار موظف': 'Employee Warning',
  'طلب مساعدة مالية': 'Financial Assistance Request',
  'طلب شراكة استراتيجية': 'Strategic Partnership Request',
  'تهنئة بترقية': 'Promotion Congratulations',
  'خطاب تعزية ومواساة': 'Condolence Letter',
  'طلب تدريب تعاوني/صيفي': 'Coop/Summer Training Request',
  'تفويض رسمي': 'Official Delegation',
  'إقرار وتعهد': 'Undertaking & Pledge',
  'إنهاء خدمة موظف': 'Employee Termination',
  'طلب تسهيلات بنكية/تمويل': 'Bank Funding/Facilities Request',
  'طلب تقرير طبي': 'Medical Report Request',
  'خطاب تغطية (Cover Letter)': 'Cover Letter',
  'رسالة تواصل LinkedIn': 'LinkedIn Connect',
  'رسالة شكر بعد المقابلة': 'Post-Interview Thank You',
  'رسالة متابعة طلب توظيف': 'Job Application Follow-up',
  'رسالة قبول/اعتذار عن عرض عمل': 'Job Offer Response',
  'إنذار قانوني رسمي': 'Official Legal Warning',
  'عقد تقديم خدمات': 'Service Agreement Contract',
  'خطاب إجازة مرضية': 'Sick Leave Certificate',
  'توصية أكاديمية': 'Academic Recommendation',
  'طلب تأجيل دراسي': 'Academic Deferral Request',
  'طلب زيادة راتب': 'Salary Increase Request',
  'طلب شهادة خبرة': 'Experience Certificate Request',
  'خطاب شكر للموظف المتميز': 'Outstanding Employee Thank You',
  'إشعار بفسخ عقد': 'Contract Termination Notice',
  'طلب إحالة طبية': 'Medical Referral Request',
  'دعوة لاجتماع مجلس إدارة': 'Board Meeting Invitation',
  'طلب دعم فني / تقني': 'Technical Support Request',
  'خطاب إخلاء طرف': 'Clearance/Discharge Letter',
  'طلب استفسار رسمي': 'Official Inquiry Request',
  'خطاب مطالبة حقوقية': 'Legal Claim',
};

