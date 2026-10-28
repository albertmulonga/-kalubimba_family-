// Traductions Kalubimba Family - Partie 1
const trans = {
    fr: {
        login: 'Se connecter', register: 'Créer un compte', logout: 'Déconnexion',
        'login-title': 'Connexion', 'login-subtitle': 'Bienvenue dans la famille Kalubimba',
        'register-title': 'Créer un compte', 'register-subtitle': 'Rejoignez la famille Kalubimba',
        email: 'Email', password: 'Mot de passe', firstname: 'Prénom', lastname: 'Nom',
        phone: 'Téléphone', country: 'Pays', city: 'Ville',
        'no-account': 'Vous n\'avez pas de compte ?', 'have-account': 'Vous avez déjà un compte ?',
        'back-home': '← Retour à l\'accueil', 'create-account': 'Créer mon compte',
        'hero-title': 'Bienvenue dans l\'application officielle de la Famille Kalubimba',
        'hero-subtitle': 'Cette application a été créée afin de renforcer les liens entre les membres de la grande famille Kalubimba, préserver notre histoire et faciliter la communication entre les différentes générations.',
        'about-title': 'Qui sommes-nous ?',
        'about-text1': 'La famille Kalubimba représente un héritage riche transmis de génération en génération. Depuis nos ancêtres fondateurs jusqu\'aux jeunes générations d\'aujourd\'hui, notre famille a toujours été fondée sur des valeurs fortes : l\'unité, le respect, la solidarité et la transmission du savoir.',
        'about-text2': 'Grâce à cette application, chaque membre peut rester connecté à la famille, découvrir l\'histoire de ses ancêtres et participer activement à la vie familiale.',
        'values-title': 'Les valeurs de la famille Kalubimba',
        'value1-title': 'Unité', 'value1-desc': 'La famille est notre première force. Nous croyons profondément que l\'unité renforce notre avenir.',
        'value2-title': 'Respect', 'value2-desc': 'Le respect des anciens et la considération des jeunes générations sont au cœur de notre culture.',
        'value3-title': 'Transmission', 'value3-desc': 'Notre histoire et nos traditions doivent être transmises afin que chaque génération sache d\'où elle vient.',
        'value4-title': 'Solidarité', 'value4-desc': 'Dans les moments de joie comme dans les moments difficiles, la famille reste un soutien indéfectible.',
        'ancestors-title': 'Nos ancêtres et notre histoire',
        'ancestors-desc': 'Nos ancêtres ont posé les fondations de la famille Kalubimba. Leur sagesse, leur courage et leurs valeurs continuent d\'inspirer les générations actuelles.',
        'ancestor0-role': 'Première génération de la famille',
        'ancestor1-role': 'Fondateur de la lignée familiale', 'ancestor2-name': 'Les Parents',
        'ancestor2-role': 'Gardiens des traditions et des valeurs familiales',
        'why-title': 'Pourquoi l\'application Kalubimba Family ?',
        'why-desc': 'Dans un monde où les familles sont souvent dispersées dans plusieurs villes et pays, il est essentiel de garder un lien fort entre tous les membres.',
        feature1: 'Garder contact avec les membres', feature2: 'Partager les événements familiaux',
        feature3: 'Conserver l\'histoire de la famille', feature4: 'Transmettre les valeurs aux jeunes générations',
        'cta-title': 'Rejoignez la communauté Kalubimba',
        'cta-text': 'Si vous êtes membre de la famille Kalubimba, créez votre compte et rejoignez la plateforme pour rester connecté avec toute la famille.',
        'footer-message': 'La famille Kalubimba n\'est pas seulement un nom, mais une histoire vivante portée par chaque génération. Ensemble, préservons notre héritage et construisons l\'avenir de notre famille.',
        'footer-rights': 'Tous droits réservés.',
        dashboard: 'Tableau de bord', welcome: 'Bienvenue', members: 'Membres',
        'family-tree': 'Arbre Généalogique', photos: 'Photos', videos: 'Vidéos',
        chat: 'Chat', memorial: 'Mémorial', settings: 'Paramètres', language: 'Langue',
        'menu-principal': 'PRINCIPAL', 'menu-medias': 'MÉDIAS', 'menu-communication': 'COMMUNICATION',
        'menu-compte': 'COMPTE', 'recent-photos': 'Photos récentes', 'recent-members': 'Membres récents'
    },
    en: {
        login: 'Login', register: 'Create Account', logout: 'Logout',
        'login-title': 'Login', 'login-subtitle': 'Welcome to the Kalubimba family',
        'register-title': 'Create Account', 'register-subtitle': 'Join the Kalubimba family',
        email: 'Email', password: 'Password', firstname: 'First Name', lastname: 'Last Name',
        phone: 'Phone', country: 'Country', city: 'City',
        'no-account': 'Don\'t have an account?', 'have-account': 'Already have an account?',
        'back-home': '← Back to home', 'create-account': 'Create my account',
        'hero-title': 'Welcome to the official Kalubimba Family application',
        'hero-subtitle': 'This application was created to strengthen the bonds between members of the great Kalubimba family, preserve our history and facilitate communication between different generations.',
        'about-title': 'Who are we?',
        'about-text1': 'The Kalubimba family represents a rich heritage passed down from generation to generation. From our founding ancestors to today\'s young generations, our family has always been founded on strong values: unity, respect, solidarity and the transmission of knowledge.',
        'about-text2': 'Thanks to this application, each member can stay connected to the family, discover the history of their ancestors and actively participate in family life.',
        'values-title': 'The values of the Kalubimba family',
        'value1-title': 'Unity', 'value1-desc': 'Family is our first strength. We deeply believe that unity strengthens our future.',
        'value2-title': 'Respect', 'value2-desc': 'Respect for elders and consideration for younger generations are at the heart of our culture.',
        'value3-title': 'Transmission', 'value3-desc': 'Our history and traditions must be passed on so that each generation knows where it comes from.',
        'value4-title': 'Solidarity', 'value4-desc': 'In moments of joy as in difficult times, the family remains an unwavering support.',
        'ancestors-title': 'Our ancestors and our history',
        'ancestors-desc': 'Our ancestors laid the foundations of the Kalubimba family. Their wisdom, courage and values continue to inspire current generations.',
        'ancestor0-role': 'First generation of the family',
        'ancestor1-role': 'Founder of the family lineage', 'ancestor2-name': 'The Parents',
        'ancestor2-role': 'Guardians of traditions and family values',
        'why-title': 'Why the Kalubimba Family application?',
        'why-desc': 'In a world where families are often scattered across several cities and countries, it is essential to maintain a strong bond between all members.',
        feature1: 'Stay in touch with members', feature2: 'Share family events',
        feature3: 'Preserve family history', feature4: 'Pass on values to younger generations',
        'cta-title': 'Join the Kalubimba community',
        'cta-text': 'If you are a member of the Kalubimba family, create your account and join the platform to stay connected with the whole family.',
        'footer-message': 'The Kalubimba family is not just a name, but a living history carried by each generation. Together, let us preserve our heritage and build the future of our family.',
        'footer-rights': 'All rights reserved.',
        dashboard: 'Dashboard', welcome: 'Welcome', members: 'Members',
        'family-tree': 'Family Tree', photos: 'Photos', videos: 'Videos',
        chat: 'Chat', memorial: 'Memorial', settings: 'Settings', language: 'Language',
        'menu-principal': 'MAIN', 'menu-medias': 'MEDIA', 'menu-communication': 'COMMUNICATION',
        'menu-compte': 'ACCOUNT', 'recent-photos': 'Recent Photos', 'recent-members': 'Recent Members'
    }
};

// Swahili (Kiswahili)
trans.sw = {
    login: 'Ingia', register: 'Fungua Akaunti', logout: 'Toka',
    'login-title': 'Ingia', 'login-subtitle': 'Karibu kwa familia ya Kalubimba',
    'register-title': 'Fungua Akaunti', 'register-subtitle': 'Jiunge na familia ya Kalubimba',
    email: 'Barua pepe', password: 'Nywila', firstname: 'Jina la kwanza', lastname: 'Jina la ukoo',
    phone: 'Simu', country: 'Nchi', city: 'Jiji',
    'no-account': 'Huna akaunti?', 'have-account': 'Una akaunti tayari?',
    'back-home': '← Rudi nyumbani', 'create-account': 'Fungua akaunti yangu',
    'hero-title': 'Karibu kwenye programu rasmi ya Familia ya Kalubimba',
    'hero-subtitle': 'Programu hii iliundwa ili kuimarisha uhusiano kati ya wanafamilia wa familia kubwa ya Kalubimba, kuhifadhi historia yetu na kuwezesha mawasiliano kati ya vizazi tofauti.',
    'about-title': 'Sisi ni nani?',
    'about-text1': 'Familia ya Kalubimba inawakilisha urithi tajiri uliopitishwa kutoka kizazi hadi kizazi. Tangu waanzilishi wetu hadi vizazi vijana vya leo, familia yetu imekuwa ikijengwa juu ya maadili imara: umoja, heshima, mshikamano na uwasilishaji wa maarifa.',
    'about-text2': 'Kwa kutumia programu hii, kila mwanafamilia anaweza kubaki ameunganishwa na familia, kugundua historia ya mababu zao na kushiriki kikamilifu katika maisha ya kifamilia.',
    'values-title': 'Maadili ya familia ya Kalubimba',
    'value1-title': 'Umoja', 'value1-desc': 'Familia ni nguvu yetu ya kwanza. Tunaamini kwa dhati kwamba umoja unaimarisha mustakabali wetu.',
    'value2-title': 'Heshima', 'value2-desc': 'Heshima kwa wazee na kuzingatia vizazi vijana ni msingi wa utamaduni wetu.',
    'value3-title': 'Uwasilishaji', 'value3-desc': 'Historia yetu na mila zetu lazima zipitishwe ili kila kizazi kijue kinatoka wapi.',
    'value4-title': 'Mshikamano', 'value4-desc': 'Katika nyakati za furaha na nyakati ngumu, familia inabaki msaada thabiti.',
    'ancestors-title': 'Mababu zetu na historia yetu',
    'ancestors-desc': 'Mababu zetu waliweka misingi ya familia ya Kalubimba. Hekima yao, ujasiri na maadili yao yanaendelea kuhamasisha vizazi vya sasa.',
    'ancestor0-role': 'Kizazi cha kwanza cha familia',
    'ancestor1-role': 'Mwanzilishi wa ukoo wa kifamilia', 'ancestor2-name': 'Wazazi',
    'ancestor2-role': 'Walezi wa mila na maadili ya kifamilia',
    'why-title': 'Kwa nini programu ya Familia ya Kalubimba?',
    'why-desc': 'Katika ulimwengu ambapo familia mara nyingi zinatawanyika katika miji na nchi nyingi, ni muhimu kudumisha uhusiano imara kati ya wanachama wote.',
    feature1: 'Wasiliana na wanachama', feature2: 'Shiriki matukio ya kifamilia',
    feature3: 'Hifadhi historia ya familia', feature4: 'Pitisha maadili kwa vizazi vijana',
    'cta-title': 'Jiunge na jamii ya Kalubimba',
    'cta-text': 'Ikiwa wewe ni mwanachama wa familia ya Kalubimba, fungua akaunti yako na jiunge na jukwaa ili kubaki ameunganishwa na familia nzima.',
    'footer-message': 'Familia ya Kalubimba si jina tu, bali ni historia hai inayobebwa na kila kizazi. Pamoja, tuhifadhi urithi wetu na tujenga mustakabali wa familia yetu.',
    'footer-rights': 'Haki zote zimehifadhiwa.',
    dashboard: 'Dashibodi', welcome: 'Karibu', members: 'Wanachama',
    'family-tree': 'Mti wa Familia', photos: 'Picha', videos: 'Video',
    chat: 'Mazungumzo', memorial: 'Ukumbusho', settings: 'Mipangilio', language: 'Lugha',
    'menu-principal': 'KATI', 'menu-medias': 'MEDIA', 'menu-communication': 'MAWASILIANO',
    'menu-compte': 'AKAUNTI', 'recent-photos': 'Picha za Hivi Karibuni', 'recent-members': 'Wanachama Wapya'
};

// Lingala
trans.ln = {
    login: 'Kokɔta', register: 'Kokela Kɔnti', logout: 'Kobima',
    'login-title': 'Kokɔta', 'login-subtitle': 'Boyei malamu na libota Kalubimba',
    'register-title': 'Kokela Kɔnti', 'register-subtitle': 'Kokɔta na libota Kalubimba',
    email: 'Email', password: 'Mot de passe', firstname: 'Nkombo ya liboso', lastname: 'Nkombo ya libota',
    phone: 'Telefone', country: 'Mboka', city: 'Engumba',
    'no-account': 'Ozali na kɔnti te?', 'have-account': 'Ozali na kɔnti?',
    'back-home': '← Zonga na ndako', 'create-account': 'Kokela kɔnti na ngai',
    'hero-title': 'Boyei malamu na application officielle ya Libota Kalubimba',
    'hero-subtitle': 'Application oyo ekelami mpo na kolendisa boyokani kati ya bato ya libota monene ya Kalubimba, kobatela lisolo na biso mpe kopesa nzela na makanisi kati ya bankola ndenge na ndenge.',
    'about-title': 'Biso tozali nani?',
    'about-text1': 'Libota Kalubimba ezali libula ya motuya oyo epesami banda nkola na nkola. Banda bakoko na biso oyo babandaki libota tii na bankola ya lelo, libota na biso etongamaki ntango nyonso na makambo ya makasi: bomoko, limemya, lisalisi mpe kopesa mayele.',
    'about-text2': 'Na nzela ya application oyo, moto nyonso ya libota akoki kozala na boyokani na libota, koyeba lisolo ya bakoko na ye mpe kosala na molende na bomoi ya libota.',
    'values-title': 'Makambo ya motuya ya libota Kalubimba',
    'value1-title': 'Bomoko', 'value1-desc': 'Libota ezali nguya na biso ya liboso. Tondimi na motema mobimba ete bomoko elongolaka mikolo na biso.',
    'value2-title': 'Limemya', 'value2-desc': 'Limemya ya bakolo mpe kotalela bankola ya lelo ezali na kati-kati ya mimeseno na biso.',
    'value3-title': 'Kopesa', 'value3-desc': 'Lisolo na biso mpe mimeseno na biso esengeli kopesama mpo nkola nyonso eyeba esika ewutaki.',
    'value4-title': 'Lisalisi', 'value4-desc': 'Na ntango ya esengo mpe na ntango ya mpasi, libota etikalaka lisalisi ya makasi.',
    'ancestors-title': 'Bakoko na biso mpe lisolo na biso',
    'ancestors-desc': 'Bakoko na biso batiaki miboko ya libota Kalubimba. Bwanya na bango, mpiko na bango mpe makambo na bango ya motuya ekobaka kopesa molende na bankola ya lelo.',
    'ancestor0-role': 'Nkola ya liboso ya libota',
    'ancestor1-role': 'Mobandi ya libota', 'ancestor2-name': 'Baboti',
    'ancestor2-role': 'Bakengeli ya mimeseno mpe makambo ya motuya ya libota',
    'why-title': 'Mpo na nini application Kalubimba Family?',
    'why-desc': 'Na mokili oyo mabota mbala mingi epalanganaka na bingumba mpe mikili mingi, ezali na ntina mingi kobatela boyokani ya makasi kati ya bato nyonso ya libota.',
    feature1: 'Kozala na boyokani na bato ya libota', feature2: 'Kokabola makambo ya libota',
    feature3: 'Kobatela lisolo ya libota', feature4: 'Kopesa makambo ya motuya na bankola ya lelo',
    'cta-title': 'Kokɔta na lisanga Kalubimba',
    'cta-text': 'Soki ozali moto ya libota Kalubimba, kela kɔnti na yo mpe kokɔta na plateforme mpo ozala na boyokani na libota mobimba.',
    'footer-message': 'Libota Kalubimba ezali nkombo kaka te, kasi lisolo ya bomoi oyo ememami na nkola nyonso. Elongo, tobatela libula na biso mpe totonga mikolo ya libota na biso.',
    'footer-rights': 'Makoki nyonso ebatelami.',
    dashboard: 'Tableau de bord', welcome: 'Boyei malamu', members: 'Bato ya libota',
    'family-tree': 'Nzete ya Libota', photos: 'Bafoto', videos: 'Bavideo',
    chat: 'Makanisi', memorial: 'Bokundoli', settings: 'Paramètres', language: 'Monoko',
    'menu-principal': 'YA LIBOSO', 'menu-medias': 'MÉDIA', 'menu-communication': 'MAKANISI',
    'menu-compte': 'KƆNTI', 'recent-photos': 'Bafoto ya sika', 'recent-members': 'Bato ya sika'
};

// Kirega (langue du Maniema, Congo-RDC)
trans.kr = {
    login: 'Kwingira', register: 'Fungura akaunti', logout: 'Sohoka',
    'login-title': 'Kwingira', 'login-subtitle': 'Samba mu muryango wa Kalubimba',
    'register-title': 'Fungura akaunti', 'register-subtitle': 'Injira mu muryango wa Kalubimba',
    email: 'Email', password: 'Ijambo ry\'ibanga', firstname: 'Izina rya mbere', lastname: 'Izina ry\'umuryango',
    phone: 'Telefone', country: 'Igihugu', city: 'Umujyi',
    'no-account': 'Ukile akaunti?', 'have-account': 'Ufite akaunti?',
    'back-home': '← Subira ku ntangiriro', 'create-account': 'Fungura akaunti yanjye',
    'hero-title': 'Samba kuri porogaramu y\'umuryango wa Kalubimba',
    'hero-subtitle': 'Iyi porogaramu yaremwe kugira ngo ikomeze umubano hagati y\'abagize umuryango munini wa Kalubimba, kubungabunga amateka yacu no koroshya itumanaho hagati y\'ibisekuru bitandukanye.',
    'about-title': 'Boni mesago?',
    'about-text1': 'Umuryango wa Kalubimba uhagarariye umurage ukomeye watanzwe kuva mu gisekuru kugeza ku gisekuru. Kuva ku basekuruza bacu bashinga umuryango kugeza ku bisekuru by\'uyu munsi, umuryango wacu wubatswe ku ndangagaciro zikomeye: ubumwe, kubaha, ubufatanye n\'ugutwara ubumenyi.',
    'about-text2': 'Binyuze kuri iyi porogaramu, buri munyamuryango ashobora gukomeza guhuza n\'umuryango, kumenya amateka y\'abasekuruza be no kugira uruhare mu buzima bw\'umuryango.',
    'values-title': 'Indangagaciro z\'umuryango wa Kalubimba',
    'value1-title': 'Ubumwe', 'value1-desc': 'Umuryango ni imbaraga zacu za mbere. Twizera cyane ko ubumwe bushimangira ejo hazaza.',
    'value2-title': 'Kubaha', 'value2-desc': 'Kubaha abasaza no gufata neza abakiri bato ni intandaro y\'umuco wacu.',
    'value3-title': 'Gutwara', 'value3-desc': 'Amateka yacu n\'imigenzo yacu bigomba gutwarwa kugira ngo buri gisekuru kizi aho gikomoka.',
    'value4-title': 'Ubufatanye', 'value4-desc': 'Mu bihe by\'ibyishimo ndetse n\'ibihe bigoye, umuryango uguma ari inkunga ihamye.',
    'ancestors-title': 'Abasekuruza bacu n\'amateka yacu',
    'ancestors-desc': 'Abasekuruza bacu bashyizeho urufatiro rw\'umuryango wa Kalubimba. Ubwenge bwabo, ubutwari bwabo n\'indangagaciro zabo bikomeje gutera inkunga ibisekuru bya none.',
    'ancestor0-role': 'Igisekuru cya mbere cy\'umuryango',
    'ancestor1-role': 'Uwashyize umuryango', 'ancestor2-name': 'Ababyeyi',
    'ancestor2-role': 'Abarinda imigenzo n\'indangagaciro z\'umuryango',
    'why-title': 'Kuki porogaramu ya Kalubimba Family?',
    'why-desc': 'Mu isi aho imiryango ikunze gutandukana mu migi n\'ibihugu byinshi, ni ngombwa gukomeza umubano ukomeye hagati y\'abanyamuryango bose.',
    feature1: 'Gukomeza umubano n\'abanyamuryango', feature2: 'Gusangira ibyabaye by\'umuryango',
    feature3: 'Kubungabunga amateka y\'umuryango', feature4: 'Gutwara indangagaciro ku bisekuru bito',
    'cta-title': 'Injira mu muryango wa Kalubimba',
    'cta-text': 'Niba ukile umunyamuryango wa Kalubimba, fungura akaunti yawe kandi winjire kuri iyi porogaramu kugira ngo ukomeze guhuza n\'umuryango wose.',
    'footer-message': 'Umuryango wa Kalubimba si izina gusa, ahubwo ni amateka y\'ubuzima atwariwe na buri gisekuru. Hamwe, reka tubungabunge umurage wacu kandi tubake ejo hazaza h\'umuryango wacu.',
    'footer-rights': 'Uburenganzira bwose burarinzwe.',
    dashboard: 'Ikibaho', welcome: 'Samba', members: 'Abanyamuryango',
    'family-tree': 'Igiti cy\'Umuryango', photos: 'Amafoto', videos: 'Amashusho',
    chat: 'Ibiganiro', memorial: 'Urwibutso', settings: 'Igenamiterere', language: 'Ururimi',
    'menu-principal': 'IBANZE', 'menu-medias': 'AMASHUSHO', 'menu-communication': 'ITUMANAHO',
    'menu-compte': 'KONTI', 'recent-photos': 'Amafoto ya vuba', 'recent-members': 'Abanyamuryango bashya'
};

// Fonction de changement de langue
let currentLang = localStorage.getItem('kalubimba_lang') || 'fr';

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('kalubimba_lang', lang);
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update all translatable elements
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (trans[lang] && trans[lang][key]) {
            element.textContent = trans[lang][key];
        }
    });
    
    // Update HTML lang attribute
    document.getElementById('html-root').setAttribute('lang', lang);
}

// Load saved language on page load
window.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('kalubimba_lang') || 'fr';
    if (savedLang !== 'fr') {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(savedLang) || btn.onclick.toString().includes(savedLang)) {
                btn.classList.add('active');
            }
        });
        
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (trans[savedLang] && trans[savedLang][key]) {
                element.textContent = trans[savedLang][key];
            }
        });
    }
});
