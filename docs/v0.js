"use strict";
let questionsdata = `
@softball
Who is your favorite superhero? @ Superman @ Batman @ Ironman @ Spiderman
What's the best pet? @ cat @ dog @ fish @ hamster
Which type of car you like the best? @ hate all cars @ small, smart cars @ medium ones, sedans @ big ones, SUVs
How often do make your bed in the morning? @ every morning @ often @ rarely @ never
What's your alarm clock set at on your average working day? @ 5am or less @ between 5am and 7am @ after 7am @ I set no alarm
Could you live without a smartphone? @ no @ yes but I'd use laptops a lot @ yes, I'm not an internet addict
Do you snore? @ no @ sometimes @ all the time
Do you exercise and maintain a fit lifestyle? @ nope @ a little bit but should be doing more @ I'm doing enough @ I'm doing too much
How many kids would you prefer to have? @ none @ 1 or 2 @ 3 or 4 @ as many as possible
How many proper pushups could you do right now in one go? @ none @ about 5 @ about 10 @ 15 or more, easy
How often do you feel depressed? @ never @ rarely @ sometimes @ always
How would you live if you could restart your life from your childhood? @ roughly the same way as now @ completely differently
If you could travel in time once, where would you go? @ to the past @ stay put @ to the future
What's your ideal living arrangement? @ alone @ with partner + kids @ in a commune of friends @ in a multigenerational house (living both with my parents and my kids)
How do you deal with depression? @ keep it to myself and hope it passes @ distract myself until it passes (e.g. with exercise) @ ask for help @ medicate myself
Which superpower would you like the most? @ invisibility @ flying @ teleportation @ mind reading
Where would you prefer to live when old and your partner is gone? @ stay home alone @ move to a friend @ move to a nursing home @ move to a child's family
Where would you live if you lost all your money, job, and friends? @ move to parents @ go to a homeless shelter @ live on the streets
Would you be your own parent? @ no, I'd be a bad parent for myself @ it would be probably okay @ I'd love to have had myself as a parent
What sort of movies do you like? @ blockbuster action movies @ romantic true story @ horrors and thrillers @ comedies
If you would be young and need to choose a carreer, what would you study? @ physics @ computers @ medicine @ accounting
What books do you like the most? @ autobiography @ romantic novels @ scifi-novels @ travel guides
What sort of book would you write if you needed to write a book? @ autobiography @ romantic novel @ scifi-novel @ travel guide
When do you brush your teeth in the morning? @ I don't brush @ before breakfast @ after breakfast
Which type of personalities do you like the most? @ intelligent @ fun @ quiet @ empathetic
How do you sleep? @ naked @ in underwear @ in an oversized t-shirt @ in pyjamas with separate pants
What new friends would you prefer the most? @ guys @ girls @ balanced
Where do you want to grow old? @ alone in the woods @ in a small village @ in a town @ in a big city
Which one is your favorite sport? @ football @ basketball @ karate @ running
What would you do with the money if you were to win the lottery? @ spend it on luxuries (e.g. nice house) @ give it away (e.g. charity or friends) @ invest it @ start my own company
How open are you with your private thoughts? @ I tell everyone everything @ I tell truthfully if asked but otherwise keep things to myself @ there are things I don't share with anyone
Where are you at in your life? @ I've done most things I wanted out of life @ there are still a few things I want to achieve @ there are lot of things I still want to do
What's your favorite way to communicate remotely? @ email @ chat/sms/whatsapp @ phone call @ video call
What's your favorite drink? @ coffee @ hot chocolate @ orange juice @ beer
What's your weight? @ 0 - 70 kg @ 70 - 90 kg @ 90-120 kg @ 120+ kg
What's your opinion when your friends talk during a movie night? @ awesome @ annoying
What's you opinion on pineapples on pizza? @ delicious @ abomination
What gives you more joy? @ to receive a gift @ to give a gift
What is your typical sleeping pattern? @ morning person (wake up early) @ evening person (stay up late) @ completely random
What's your favorite drug for watching movies? @ potato chips @ tortilla chips with a nice sauce @ popcorn @ no drugs, no distraction
Would you lasik your eyes if you had vision issues? If you already had one: would you lasik again if it worsened? @ no @ yes
Would you want to know your exact death date? @ no, I'd prefer it to be a surprise @ yes, but only the year number @ yes, the exact day
Would you modify your baby's genes if it were possible? @ no, I'd leave it as nature intended @ I'd fix only serious life-hardening issues @ sure, I'd make it smart and attractive
Would you preserve your brain if it would keep your experience ongoing and avoid death? @ yeah, I don't want to die @ no, death is natural and I'm curious what's after death
Which apartment do you prefer? @ ground floor @ middle floor @ top floor
Which is your preferred way to listen to content when it has to be done quietly? @ earphones @ headphones @ speakers but very quietly
Which cheap gift would like the most to receive? @ a bouquet of flowers @ a box of chocolate @ a lottery scratchcard @ a pair of socks
How would you prefer to go camping? @ alone or with your partner @ with a small group of friends @ with a small group of strangers @ with a large group
How do you handle when you feel overwhelmed? @ I shut down and stress myself @ I ask for help @ I methodically work through it @ this never happens to me
How far would you prefer to live from your parents and other family? @ very close @ a healthy distance, about a day's worth of travel at least @ very far
What's your preferred way to read a book? @ smartpone because it's most convenient @ kindle because it's light but similar to paper @ paper book @ audiobook
What's your ideal activity for your free time? @ exercise @ tv/phone/internet @ meeting friends @ working on something
What activity do you do the most in your free time? @ exercise @ tv/phone/internet @ meeting friends @ working on something
What would you do if you suddenly became bedridden for life? @ stay at home and ask partner and family to take care of me @ stay at home and ask for a care service to take care of me @ live at a care center @ euthanasia
How satisfied are you with your life in general? @ happy as I am @ I'm a bit unhappy but not sure what I want @ I wish I could try or achieve certain things
What's your most favorite exercise? @ pushups @ pullups @ sit-ups @ squats
What's your least favorite exercise? @ pushups @ pullups @ sit-ups @ squats
Who cuts your hair? @ I do @ my hairdresser @ my partner/friend/family @ my hair needs no cutting
Everyone on Earth gets all-knowing glasses. What statistic should the glasses display above people's heads? @ their name @ their mood @ their relationship status @ their net worth
What should happen to you dead body once you die? @ buried so that worms and ants can feed on me as I rot away @ cremated for a quick and clean disposal @ donated to medical university so that students can play with me @ museum so that everyone can see me for a while
There's is a pill that prolongs your life with 10 years (from 70 to 80) but you have to take it every day and can't miss a day. @ I will meticulously take it every day, yay for 10 extra years @ I will try to take it but no big deal if it's a hassle @ too much effort, don't want to live that long anyway
What's your favorite season? @ spring @ summer @ autumn @ winter
Which of these would be the most devastating for you to lose? @ your dominant arm @ a leg @ hearing @ your wealth (losing all your money, investments, house/apartmant)

@divisive
What's after death? @ nothing @ we reincarnate @ we meet the biblical God @ we exit the "simulation" and meet our universe administrators
What's your opinion on abortions? @ should be easy to get @ should be hard to get @ should be completely illegal and people should take care of their unwanted children @ should be illegal but the people should be able to give the baby to government no questions asked and then the government would give the orphans high quality care
What's your opinion on climate change? @ it's a lie, there's no climate change @ it's overblown, humanity is not in danger @ humanity will fix it @ humanity is doomed
What should people do when everything is fully automated? @ people should be still working so that we don't get lazy @ we get free money and capitalism sorts things out @ everyone receives free services (food, shelter, care, internet) and they can do whatever they want
What's your opinion on gun ownership? @ must be fully banned @ must be licensed @ should be easily accessible
How should cannabis and other drugs be legislated? @ they should be legal and easily accessible @ they should be allowed but in a very limited form @ they should be illegal
Who should be allowed to be married? @ a man and a woman @ any two people @ any number of people @ marriage shouldn't exist as a legal concept
Would you allow parents to alter their baby's genes? @ no, they have no right for that @ yes but only to fix known life-hardening issues @ yes, it's their DNA they can do anything
What would you do if your country were under military attack? @ try to evacuate @ hide and wait until it's over @ support the troops in a non-fighting way @ become a soldier
Would you ban advertisement? @ no, it's a free country @ limit it a little bit @ ban them in popular spaces, too distracting visually
How should paternity benefit be handled? @ men should get the same benefit as women @ men should get less benefit since they didn't give birth and don't need to breastfeed
How much should government support mothers? @ no support, mothers should get children when they can take it financially @ government should help only the poorest mothers who don't have any other options @ government should give generous benefit to encourage getting children and a healthy environment for them
Should trans people be allowed to compete in olympics? @ yes @ only female -> male transitioned @ only when transitioned at a very young age @ no
Should assisted suicide be allowed? @ no, never, no matter how much the patient is suffering @ only for terminal patients @ yes for everyone but with lots checks and balances @ yes for everyone with minimal bureaucracy since everyone is responsible for their own body
Should smoking be allowed? @ no @ only in very limited, closed places @ yes, almost everywhere
Are men and women equal? @ yes @ yes but only until the woman gets pregnant @ no, laws should protect women more so that they are encouraged to get children without a worry
How would you address immigration? @ disallow, people should improve their homeland @ allow in limited form for skilled people and some refugees @ allow generously @ remove all borders
Which medium is the most harmful for society at large? @ video games and movies @ social networking sites @ video sharing sites @ news organizations
How should healthcare be managed? @ centrally by the government, no private market be allowed @ solely by the private market @ have both government and private market providers and have them compete
Should death penalty be allowed? @ yes, we should execute really bad people @ people with life sentence should be given the option for assisted suicide @ no, people should be locked away forever without the option of death
Should kids be allowed to change their gender in young age via hormone therapy other intrusive methods? @ yes because the earlier started the more effective the treatment is @ not until it they are teenagers @ not until they are adults @ all such treatments should be banned
Should conscription be a thing? @ no, it's a waste of time @ yes but optionally @ yes, mandatorily, some discipline won't hurt
What should be done with big banks? @ leave them as they are @ split them up @ regulate them @ make them into a government run institutes
What should be the rule if we could sustain consciousness for a brain in a jar without any real body? (assume communication happens through computers) @ such life is inhumane, this should be banned @ it's fine, it's just one organ, not a full human @ it's up to each brain to decide if they want to live this way
Should copyright be abolished? @ yes @ no, because creators need it to protect their monetary income so that plagiarizers cannot take away their profits (money argument) @ no, because creators need it to protect their creations so that they cannot be associated with content they don't like, e.g. the artist's music in a video that the artist wouldn't agree with (control argument) @ no, because creators need it to remain creative; if people can copy ideas freely then creators wouldn't want to create (creativity argument)
How long should patents last? @ patents should be abolished @ about ~5 years because technology is rapidly changing @ the current 20 years is ok @ forever
Should homeschooling be allowed? @ no @ only if a public school does quality control through regular testing and the kid passes them @ yes, each parent does whatever they want with their kid
Should private schools be allowed? @ no because then there's no incentive to improve public schools @ no because it increases inequality between people @ yes but only if such schools accept certain amount of kids for free @ yes, private corporations can do whatever they want
What should be done with robots if they could think and act like humans and we couldn't really distinguish them from humans? @ should have the same rights as humans @ they are robots, should continue obeying humans @ should be destroyed
Should vaccination be mandated? @ no @ only a few select vaccines, much fewer than what is mandatory today @ yes
What's your stance on vaccinating yourself? @ avoid vaccination wherever possible @ only the mandatory ones @ only mandatory and the highly recommended ones @ I like vaccines, it's a good exercise for the immune system
5 people are tied to a train track and a trolley is running towards them. They will be killed in a few seconds. You stand in front of a lever which can derail the train onto a track which has only one person tied to the track. @ pull the lever to kill one person, save 5 @ leave things as they are, you are just an innocent bystander
Is torture morally OK? @ it's never OK and should be never used @ it's never OK but very practical @ it's OK but only if it's being done to very bad people @ it's OK, even to potentially innocent people, if it can potentially save lives
Should restaurants, barbers, escorts be allowed to refuse clients based on race? @ no, it should be illegal for all @ it should be allowed for some, not for others @ yes, everyone should be allowed to discriminate as they wish
Should prostitution be legal? @ it should be completely illegal @ it should be heavily regulated @ there should be only some light rules around it @ everyone should be free to do whatever they want
Should incest sex be illegal? @ it's fine, people do whatever they want @ it's fine because it's victimless as long as it's not used for making babies @ any such sexual activity should be completely illegal
How should sites like facebook and youtube be moderated? @ no moderation, free spech for all! @ light moderation, just to stop the worst kinds of discussions, people have to learn to have thick skin @ heavy moderation so that it's a safe place for all
Should the state have the ability to read and monitor our private messages without a warrant? @ yes, if it helps preventing crime and fraud @ no, privacy is more important even if it means more crime
What should be expected from migrants? @ migration should not be allowed, everyone should stay home @ migrating is OK if the migrant gives up their home culture and religion in favor of the new country's culture @ migrants can come with their culture but the new country isn't obligated to support it @ if a country accepts migrants, it should do its best to accept the migrant's culture too
If we need to settle on one form of tax only, which should it be? @ transaction tax (e.g. 20% of every purchase goes to state) @ wealth tax (e.g. 20% of the total wealth of each person and company must go to state each year) @ land tax (e.g. homeowners pay tax based on rent in their area) @ pollution tax (e.g. companies generating pollution must have expensive licenses to do so)
What's your opinion about masturbation? @ it's a shameful activity, people should not do it @ it's shameful but OK to do it as long as people don't talk about it @ it's healthy we should talk more about it @ it's healthy and we should be even more open about it, make it a normal day to day activity friends can do together
What should the primary thing for the government to do when low on money? @ print more money (modern monetary theory) @ get loans @ tax more @ austerity: tighten up and reduce benefits, support, and other expenses
Should smartphones be banned at school? @ no, that would infringe on kids' freedom @ only during classes and teachers should have the authority to confiscate them during classes @ yes because it causes too many quarells between the teachers and kids
Should government allow monopolies? @ yes, government shouldn't dictate how companies are running @ monopoly is OK as long as it is government owned company (e.g. public transportation, utility companies) @ no, large companies should be split to avoid the concentration of power

@intimate
Do you like being tickled? @ no @ just a little bit @ I want to be tickle-tortured
What's your opinion on peeing during a shower? @ it's gross @ it's OK @ it's the best way to pee
How do you wipe your ass after WC? @ while standing @ while sitting @ I don't wipe
Of who have you taken naked pics that are still viewable in your phone's photo gallery? Select the first answer that applies. @ my partner @ some other people @ myself @ nobody
Are you able to swallow cum? @ no @ sometimes @ yes @ don't know because never had cum in my mouth
Do you like body hair? @ no @ I don't mind @ yes
What breasts you like the most? @ I don't like breasts @ small @ medium @ large
Have you ever come from anal stimulation? @ no and I don't want to try it @ no but would like to try it @ I have tried but not succeeded yet @ yes
What noises do you like to hear during sex? @ quiet @ moaning @ nice talk @ dirty talk
What noises do you like to make during sex? @ quiet @ moaning @ nice talk @ dirty talk
Do you have a friend with "benefits" outside your primary relationship? @ no and not interested in having one @ no but I wish for one @ not currently but had one in the past @ yes, i have one currently
Which sex toy you own? Pick the first that apply. @ fake vagina or penis @ vibrator @ penis ring @ none of the above
What peculiarity does your genital have? Pick the first that applies. @ it has a piercing @ it has a tattoo on it or very near it @ it is special in a different way @ it's ordinary, nothing special
What's your favorite body part that you like to play with? @ boobs @ penis @ vagina @ ass
Have you tried group sex? @ no and not interested @ I'd like to try it @ I had a threesome @ I had groupsex with many people
How easy is it for you to reach orgasm? @ almost impossible @ needs a lot of work @ matter of seconds
How many people expressed love or sexual interest to you that you rejected thorough your life? @ none @ one @ a few @ a lot
Which body part would you change on yourself? @ face @ genital @ chest @ hair
When did you lose your virginity? @ 0-16 @ 17-21 @ 22 or later @ I'm still a virgin
How often do you masturbate on average? @ never @ monthly @ weekly @ daily
Which role would you prefer if you needed to do this for a full hour? @ receiving oral sex @ giving oral sex @ having sex
How would you feel about getting naked in a gender neutral clothes changing room of a gym or swimming pool? @ no problem @ a bit ashamed, would try to change as discreetly as possible @ ashamed, I would need to go to a private changing booth
Which penis do you find more aesthetically pleasing? @ circumcised @ intact
Would you enter a couple's relationship as a third party? @ sure, no problem @ only for an experiment, not for long term @ no
What's your preferred sex position? @ missionary @ cowgirl @ doggy @ standing sex, e.g. in shower
Do you mind receiving dick picks? @ I like them @ I don't mind them @ I hate them
Would you participate in porn? @ sure, no problem, sex is fun @ only for ton of money @ private sex tape is OK, but it shouldn't be shared @ no
How much porn do you watch? @ none @ a little now and then @ too much
What do you wish you had more from your parents during your childhood? @ love @ freedom @ discipline @ money
What is the biggest benefit of a relationship for you? @ sex @ sharing money or chores @ sharing a life @ not being alone
What's your oral sex preferences? @ I prefer giving it @ I prefer receiving @ I don't like sex either way
Would you date yourself, a person with your exact personality? @ yes, I'd love myself @ no, I'd hate myself
Would you go to a naked sauna with others? @ sure, no problem @ only with my partner @ no because I'm too shy @ no because I don't like saunas
Would you play strip poker in a group? @ already played @ never played but would like to try @ no
What do you like about your genital the most? @ how it looks like @ how it feels like @ how it smells/tastes like @ its endurance
What do you like about your genital the least? @ how it looks like @ how it feels like @ how it smells/tastes like @ its endurance
How many different people had you have sex with? @ <= 1 @ 2-3 @ 4-5 @ 6+
What's the biggest problem in your sex life? @ no lust @ no time @ genital not working as desired @ no partner
Do you like makeup on women? @ yes @ a little bit doesn't hurt @ no
Do you like breast implants in women? @ yes @ fine either way @ only if otherwise the woman would be flat-chested @ no
Do you like filled lips in women? @ yes @ fine either way @ no
How would try finding a partner if you were single? @ online dating @ real-life speed dating events @ bar @ ask friends if they know of somebody
How satisfied are you with your sex life? @ too much sex in my life @ just about right @ not enough sex in my life @ sex doesn't interest me
Would you have sex with a friend if they really wanted to? @ no, I'm very picky @ no, I'm a monogamist @ only with some @ sure, sex is fun
Have you ever had a friend with whom you masturbated together but otherwise never had sex together? @ yes, I did @ yes, I still do @ no but would like to have one @ no, I'm not into such friends
Where do you masturbate most often? @ bathroom @ in the bed @ in the shower @ in front of the tv or computer
How would you describe your relationship to your parents? @ good @ bad @ complicated @ nonexistent
How often did you consider suicide in the past? @ never @ occasionally @ often @ all the time
Have you ever received penetrative anal sex? @ no and it doesn't interest me @ no but wouldn't mind trying @ yes and I liked it @ yes but didn't really like it
Have you ever given penetrative anal sex? @ no and it doesn't interest me @ no but wouldn't mind trying @ yes and I liked it @ yes but didn't really like it
Have you ever received asshole licking? @ no and it doesn't interest me @ no but wouldn't mind trying @ yes and I liked it @ yes but didn't really like it
Have you ever licked an asshole? @ no and it doesn't interest me @ no but wouldn't mind trying @ yes and I liked it @ yes but didn't really like it
Did your parents do a good job? @ no @ yes
Do you get enough love in your life? @ no @ yes
What is your love language? What makes you feel loved the most? @ compliments or gifts @ quality time (e.g. dates, vacations) @ acts of service (e.g. doing chores) @ physical touch
Why do you hold your religious beliefs? @ because that's how I was raised and didn't think much about it @ because I know it's the most right view and everyone else is wrong @ for practical reasons, it's a way to connect with friends and family @ I'm forced to hold the views due to external factors
Have you been with escorts? @ nope, I'm against the idea entirely @ nope, just not interested @ only once as an experiment @ several times
Would you date / marry an escort? @ no @ date yes, marry no @ maybe, if they are selective with the clients @ yes, the nature of the job doesn't bother me
Would you date / marry a porn star? @ no @ date yes, marry no @ maybe, if they are selective with the clients @ yes, the nature of the job doesn't bother me
Would you date / marry nude model, a person who sells naked pics of themselves for money? @ no @ date yes, marry no @ yes, the nature of the job doesn't bother me
Would you mind doing naked modeling or selling naked pics of you for money? @ I would mind because I don't want others see me naked @ I wouldn't mind doing it under certain conditions (someone has to manage me, good money, etc) @ I have done this or doing this
What do you not like about your genital? @ how it looks like @ its sensitivity or performance @ the pain it causes @ type (I want the other gender's genital)
When you born again, which sex would you want to be? @ female @ male
How interested are you seeing other people nude? @ I don't want to see others naked @ I don't care about others naked @ I like to check out others @ seeing others naked makes me very happy
Would you like to have a friend with benefits? @ yes any gender @ yes but only of my preferred gender @ no
What would you do if you became bald? @ wear a wig @ wear a hat @ accept/embrace @ hair transplant
Do you find bald people attractive? @ no @ some people are cool with no hair but not everyone @ prefer bald people
Which death would you prefer? @ sudden death @ slow death such as cancer so that there's some preparatory time
What would you want more in life? @ more sex @ more money @ more fame @ more free time
Of what nature is your most worrying medical condition? @ birth defect @ something that developed over time on its own @ something I made happen due to bad (life) choices @ something someone else made to me
Would you recommend yourself as a partner for another person? @ yes because I would be a good partner @ yes but just because life is easier with a partner @ only for short term, long term relationships are hard @ no, I'm terrible
You must sacrifice an activity. You can never do this anymore in life. Which one you pick? @ meeting friends @ browsing/watching internet/youtube/netflix/etc @ having sex @ exercising
Do you feel bad or ashamed after masturbation? @ I don't masturbate @ not really @ only when I'm doing it too much @ yes, always
Do you like masturbating with others? @ I never masturbate @ I only masturbate alone or with my partner @ I like the idea of having platonic friends with whom I can masturbate with @ I like the idea of visiting a club where I could masturbate with others
What is your least favorite sex act of these? @ receive oral sex @ give oral sex @ penetrative sex @ mutual masturbation
What is your most favorite sex act of these? @ receive oral sex @ give oral sex @ penetrative sex @ mutual masturbation
How big of an issue would your death be? @ none as I have a will, inheritance, and funeral all set up @ there's some work my family needs to do but they should be ok @ it would be hard for my family as they depend a lot on me being alive and healthy
How difficult do you deem your life in average? @ easy @ medium @ hard @ nightmare
Which sex act have you done with both genders? Pick the first that applies. @ my genital touched both vagina and penis already @ oral sex @ handjob @ none or other
Which of these would you use to describe yourself? @ dependable @ good looks @ fun @ smart
What's the most annoying trait of you? @ boring or lazy @ workaholic @ stubborn @ bad communication skills
How honest are you with others (e.g. your partner)? @ radical honesty, I tell everything @ I might keep some stuff to myself but never lie @ I sometimes might tell small lies about subjective things (e.g. "this was delicious food" when it wasn't) @ I might make small objective lies when it reduces stress and drama

@partner
How acceptable is your partner's social life for you? @ it's too much for me @ it's about right @ I wish my partner had more social life @ I wish my partner had a different social life
Have you had sex with another person after your current relationship started? @ no @ yes @ multiple people even
How do you handle serious disagreements with your partner? @ shouting @ talk through them like responsible adults @ give each other the silent treatment @ we never argue
Would you swap your partner with someone else for a week? @ no @ yes but only if sex is strictly off limits @ yes, it would be a nice experiment
Which body part would you change on your partner? @ face @ genital @ chest/boobs @ hair
Would you like to have sex with someone else than your partner? @ no, my partner is enough @ I wouldn't mind trying but I'm fine as is too @ yes, I think I'd be happier if I could try that
Do you mind if your partner watches porn and masturbates to it? @ it's fine @ it's fine if I'm not around @ I'd prefer if they wouldn't do that @ I'd be upset if they would be doing that
Would you be open for opening up your relationship to a third party or parties? @ yes, I'd like to @ yes, if my partner really wants to @ only for short experiments @ not a chance, I'm strictly monogamous
What should your partner have more of? @ self-confidence @ self-discipline @ kindness @ lightheartedness
Who initiates sex more often? @ me @ my partner @ about the same
What chore should your partner do more of? @ cleaning @ shopping @ laundry @ cooking
What should your partner do more? @ exercising @ studying @ socializing @ working
What should your partner do less? @ smartphoning @ smoking/drinking @ working @ partying
How do you prefer your partner better? @ with lots of makeup @ with little makeup @ without makeup
What do you like about your partner's genital the most? @ how it looks like @ how it feels like @ how it smells/tastes like @ its performance
What do you miss the most when your partner is away? @ sex @ cooking @ the chores they finish @ presence in general
Would you mind breast implants? @ I don't mind them if my partner wants them @ I'd prefer to not have them for me or for my partner
Would you mind lip filling? @ I don't mind them if my partner wants them @ I'd prefer to not have them for me or for my partner
How often do you fight with your partner on average? @ daily @ weekly @ monthly @ never, we live in a harmony
What way of your partner getting more sex would annoy you the least? @ transactional sex with an escort @ sex in a secondary relationship @ threesome sex with you present @ your partner not having sex with other people even if that means depression and suffering for them
What way of your partner getting more sex would annoy you the most? @ transactional sex with an escort @ sex in a secondary relationship @ threesome sex with you present @ your partner not having sex with other people even if that means depression and suffering for them
How would you prefer your partner to sleep? @ naked @ in underwear @ in an oversized t-shirt @ in pyjamas with separate pants
What would you do if your partner suddenly became bedridden for life? @ stay with them and take care of them forever @ start a new life but take care of them @ start a new life without them
Would you watch your partner having sex with someone else? @ no, I wouldn't allow my partner to have sex with others @ I don't want to be present @ sure, I'd be happy to watch @ sure, I'd be happy to record it even
What's the best description of your partner? @ dependable @ good looks @ fun @ smart
What's the most annoying trait of your partner? @ boring or lazy @ workaholic @ stubborn @ bad communication skills
Is it important that your partner looks good? @ no, I don't care about the looks @ there's a minimum standard I like to have (e.g. daily shower, clean clothes) but I don't care above that @ it's important to me that my partner looks top form all the time
Do you have anal sex with your partner? @ never tried @ tried but it's not for us @ occasionally @ regularly
What would you prefer your partner to masturbate to? @ naked or videos of me on their phone @ porn
Suppose you hate each other and are divorcing. E.g. the partner is too lazy, does nothing all day, drives you crazy, and divorce is the only option. How would you split possessions and wealth? @ let the partner take whatever they want @ 50-50 @ based on contributions (e.g. who earned more from work gets more) @ let the law decide on a fair split
What attracted you to your partner? @ money @ personality @ sex @ food (i.e. their cooking)
Would you try couples dating? @ no @ yes but just for vanilla dates such as common lunches or vacations @ yes for spicy things too to keep life interesting
How would you react if you learned your partner cheated? @ leave right away @ threaten them that I leave if it happens again @ no big deal but ask them to tell me before @ no big deal, I'd thank them for telling me
How often do you think about sex with different people than your partner? @ I never think about sex @ never @ sometimes @ often
How often do you think about leaving your relationship? @ never @ sometimes @ often
If you could ask for one 3 minute activity each evening from now on from your partner, which one would you prefer to receive? @ oral sex @ handjob @ massage @ joint shower
If you need to give one 3 minute activity each evening from now on to your partner, which one would you prefer to give? @ oral sex @ handjob @ massage @ joint shower
Which one would be the worst secret to hold by your partner? In other words which secret would they definitely need to tell you? @ they french kissed someone else @ they don't love you or otherwise feel unhappy with you @ they have romantic feelings towards someone else @ they feel sad
Which one would be the least worst secret to hold by your partner? In other words: which secret they wouldn't need to admit to you? @ they french kissed someone else @ they don't love you or otherwise feel unhappy with you @ they have romantic feelings towards someone else @ they feel sad
Science evolved and all diseases (including sexually transmitted diseases) are eliminated, birth control is also 100% perfect. Would you still expect monogamy or other sexual restraint from your partner? @ yes due to tradition and religious reasons @ yes so that they don't fall in love with others through sex @ yes so that we have something special just between us @ no because sex has no risk, it's then no different than dancing or getting massage, it would be another fun activity to do with friends

@light-dares
dare: Do you want to pour a glass of water over their head?
dare: Do you want to pour a glass of water over their t-shirt?
dare: Do you want to kiss their cheek?
dare: Do you want to kiss their hand?
dare: Do you want to kiss their sole?
dare: Do you want to french kiss them?
dare: Do you want to drink something from their mouth?
dare: Do you want to bite their ear?
dare: Do you want to bite their neck?
dare: Do you want to slap their clothed ass?
dare: Do you want to slap their face?
dare: Do you want to have your hands go through their hair?
dare: Do you want to hug them?
dare: Do you want to put your ear on their chest and listen to their heartbeat?
dare: Do you want to give them a feet massage?
dare: Do you want to give them a shoulder massage?
dare: Do you want to scratch their back?
dare: Do you want to smell their feet?
dare: Do you want to tickle their armpits?
dare: Do you want to tickle their feet?
dare: Do you want to lick their armpit?
dare: Do you want to lick their cheek?
dare: Do you want to lick or bite their ear?
dare: Do you want to lick or bite their lips?
dare: Do you want to lick their navel?
dare: Do you want to lick their palm?
dare: Do you want to lick their sole?
dare: Do you want to lick their teeth?
dare: Do you want to suck their finger?
dare: Do you want to suck their toe?
dare: Do you want to suck their tongue?
dare: Do you want to play dentist and examine their mouth?
dare: Do you want to play ear doctor and examine their ear?
dare: Do you want to take off all their upper body clothing and see them topless?
dare: Do you want to pull all their bottom body clothing and see them bottomless?
dare: Do you want to take off all their clothing and see them fully naked?
dare: Do you want to put your hands under their t-shirt and feel out their chests or breasts?
dare: Do you want to put your hands into their pants and feel what's between their legs?
dare: Do you want to slap their naked ass?

@hot-dares
dare: Do you want to have a naked hug with them?
dare: Do you want to take a photo of their bare chest / breasts and keep it?
dare: Do you want to take a photo of their genital and keep it?
dare: Do you want to take a photo of their asshole and keep it?
dare: Do you want to take a photo of their fully naked body without face and keep it?
dare: Do you want to take a photo of their fully naked body with face and keep it?
dare: Do you want to kiss their asshole?
dare: Do you want to kiss their genital?
dare: Do you want to kiss their nipple?
dare: Do you want to lick their asshole?
dare: Do you want to lick their genital?
dare: Do you want to lick their nipple?
dare: Do you want to suck their genital?
dare: Do you want to suck their nipple?
dare: Do you want to massage their bare chest / breasts?
dare: Do you want to massage their genital?
dare: Do you want to massage their asshole?
dare: Do you want to hug them from behind while your hand massages their genital?
dare: Do you want to have your genital touch their genital?
dare: Do you want to play anal doctor and examine their asshole up close?
dare: Do you want to play a doctor and examine their genital up close?

@activities
vote: Should we go for a boat tour?
vote: Should we go for a hike?
vote: Should we go for a handcuffed hike? (handcuff or tie ourselves together into a chain to make the hike more challenging)
vote: Should we go for a picnic?
vote: Should we go for a road trip?
vote: Should we go for a run?
vote: Should we go for a swim?
vote: Should we go for a weekend getaway somewhere?
vote: Should we go camping?
vote: Should we go kayaking?
vote: Should we go volunteer together somewhere?
vote: Should we have a movie night?
vote: Should we have a board game night?
vote: Should we do a video game night?
vote: Should we try a gym together?
vote: Should we do a bike tour?
vote: Should we go to a disco?
vote: Should we go to a cinema?
vote: Should we go to a concert?
vote: Should we go to a museum?
vote: Should we go to theatre?
vote: Should we go to standup comedy event?
vote: Should we take a gardening class together?
vote: Should we take a meditation class together?
vote: Should we take a cooking class together?
vote: Should we take a woodworking class together?
vote: Should we take a yoga class together?
vote: Should we do a group hug?
vote: Should we do a karaoke night?
vote: Should we play blindfolded face recognition? One person is blindfolded, another person gets in front of them, and they have to guess who they are solely by touching the face.

@naughty-activities
vote: Should we go to a nudist beach?
vote: Should we go to a nudist sauna?
vote: Should we do a naked hike?
vote: Should we do a strip poker night?
vote: Should we do a naked dinner night?
vote: Should we have a cozy group shower and clean each other? (the smaller the shower cabin the better)
vote: Should we try masturbating together?
vote: Should we try doing an oral sex circle? (lie in a circle, heads between the next person's legs)
vote: Should we try doing a hand sex circle? (stand or lie in a circle, each person's hand between the legs of the person on right)
vote: Should we have a sleep-together-in-one-big-bed and have-a-tickle-and-pillow-fight night?
vote: Should we have a who-can-piss-most-far contest? (ladies would be the judges)
vote: Should we watch some porn together?
vote: Should we take a nude group photo?
vote: Should we do a naked group hug?
vote: Should we do a group kiss? (basically put all our tongues together)
vote: Should we do a partner swap for a night? (assuming 2 couples are playing, skip to next otherwise)
vote: Should we play blindfolded genital recognition? One person is blindfolded, another person gets in front of them, and they have to guess who they are solely by touching the genitals.
`;
let version = 0;
var responsebits;
(function (responsebits) {
    responsebits[responsebits["empty"] = 0] = "empty";
    responsebits[responsebits["answermask"] = 7] = "answermask";
    responsebits[responsebits["answerermarker"] = 8] = "answerermarker";
    responsebits[responsebits["nextmarker"] = 16] = "nextmarker";
    responsebits[responsebits["revealmarker"] = 32] = "revealmarker";
    responsebits[responsebits["kickmarker"] = 64] = "kickmarker";
})(responsebits || (responsebits = {}));
class statusdesc {
    emoji;
    tag;
    desc;
    constructor(emoji, tag, desc) {
        ;
        [this.emoji, this.tag, this.desc] = [emoji, tag, desc];
    }
}
const statusdescs = {
    empty: new statusdesc("?", "unknown", "This is an internal error."),
    network: new statusdesc("…", "network", "Waiting for a response from the host's computer."),
    questionvolunteer: new statusdesc("👋", "volunteer", "Someone has to volunteer to answer the question."),
    darevolunteer: new statusdesc("👋", "volunteer", "Someone has to volunteer to receive the dare."),
    wait: new statusdesc("⌛", "wait", "Wait until other players make their move."),
    respond: new statusdesc("🎲", "respond", "Pick an answer."),
    guess: new statusdesc("🤔", "guess", "Guess what the answerer will answer."),
    congrats: new statusdesc("👍", "congrats", "Everyone guessed your answer correctly, congratulate them."),
    interrogate: new statusdesc("😐", "interrogate", "Some guessed your answer wrong, investigate why."),
    correct: new statusdesc("✅", "correct", "Your answer is correct."),
    wrong: new statusdesc("❌", "wrong", "Your answer is wrong."),
    plan: new statusdesc("📅", "plan", "The group is interested in the activity, make a plan for it."),
    skip: new statusdesc("🚫", "skip", "Not enough enthusiasm for this activity, skip it."),
    pick: new statusdesc("👈", "pick", "Pick someone and give them your body."),
    watch: new statusdesc("📺", "watch", "Wait until the receiver picks a volunteer and then enjoy the show."),
};
class client {
    clientID;
    username;
    networkStatus;
    conn;
    channel;
    constructor(clientID, conn, ch) {
        this.clientID = clientID;
        this.username = "";
        this.networkStatus = "";
        this.conn = conn;
        this.channel = ch;
    }
}
class userstatus {
    active; // true iff there's an active client behind this user
    response;
    constructor() {
        this.active = true;
        this.response = 0;
    }
}
let g = {
    // All questions for each category.
    questions: [],
    // The questions but shuffled.
    shuffledqs: [],
    // The currently enabled categories.
    categories: {},
    // The current question index from shuffledqs.
    questionIndex: 0,
    // The currently displayed question and its stat.
    currentQuestion: [],
    filteredIndex: -1,
    filteredQuestions: -1,
    currentPos: "", // the "card 12/34" string precomputed
    gameSeed: 0,
    // To abort a sig request if there's on in flight.
    aborter: null,
    // All the currently connected clients when hosting.
    // In client mode clients[0] contains the connection to the host.
    // In host mode clients[0] has null connection.
    clients: [],
    // Just to have insight into what's happening.
    networkStatus: "",
    // Player statuses as received by the p host->client message.
    playerStatuses: new Map(),
    // The last status sent, used to detect discrepancy from host.
    sentStatus: responsebits.empty,
    // Whether hosting or just connected to the client.
    // In client mode the client's connection to host is in clients[0].
    clientMode: false,
    // The fontsize of the question currently show such that it fits the screen.
    fontsize: 0,
    // Which button is being pressed. That one should be colored grey.
    downbutton: responsebits.empty,
    // In host mode this tracks the current answerer's username if set.
    answerer: "",
    // If true then the users cannot interact with the answers, e.g. during the volunteer phase.
    disableInteraction: true,
};
function escapehtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
let nameRE = /^[\p{Letter}\p{Mark}\p{Number}.-]{1,12}$/u;
function validateName(n) {
    return nameRE.test(n);
}
function saveCustomQuestions() {
    handleParse();
    if (hCustomText.value == "") {
        localStorage.removeItem("awocards.CustomQuestions");
    }
    else {
        localStorage.setItem("awocards.CustomQuestions", hCustomText.value);
    }
}
let saveCustomQuestionsTimeout;
function handleCustomTextChange() {
    clearTimeout(saveCustomQuestionsTimeout);
    saveCustomQuestionsTimeout = setTimeout(saveCustomQuestions, 1000);
}
// Seedable random from https://stackoverflow.com/a/19301306/103855.
let m_w = 123456789;
let m_z = 987654321;
let mask = 0xffffffff;
function seed(i) {
    m_w = (123456789 + i) & mask;
    m_z = (987654321 - i) & mask;
}
function random() {
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
    let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
}
function selectQuestions() {
    for (let cat in g.categories) {
        g.categories[cat] = document.getElementById("hq" + cat[0]).checked;
    }
    let cnt = 0;
    for (let q of g.shuffledqs) {
        if (g.categories[q[0]])
            cnt++;
    }
    g.filteredQuestions = cnt;
}
function shuffle(seednumber) {
    selectQuestions();
    let qs = g.questions.slice();
    // Shuffle the questions.
    if (seednumber != 0) {
        seed(seednumber);
        for (let i = qs.length - 1; i > 0; i--) {
            let j = Math.floor(random() * (i + 1));
            [qs[i], qs[j]] = [qs[j], qs[i]];
        }
    }
    g.shuffledqs = qs;
}
function handleCategoryChange() {
    let cats = "";
    for (let cat in g.categories) {
        if (document.getElementById("hq" + cat[0]).checked)
            cats += cat[0];
    }
    localStorage.setItem("awocards.Categories", cats);
}
function handleSeedPreview() {
    shuffle(parseInt(hSeed.value));
    let html = "";
    for (let q of g.shuffledqs) {
        if (g.categories[q[0]])
            html += `<li>${escapehtml(q.join(" @ "))}\n`;
    }
    hSeedPreview.innerHTML = html;
    location.hash = "#preview";
}
function makeQuestionHTML(q, name) {
    if (q.length <= 1) {
        return "loading...";
    }
    let answerid = 0;
    let a = () => {
        answerid++;
        if (name == "")
            return ""; // not interactive mode.
        let props = `id=ha${answerid}`;
        for (let ev of ["mousedown", "mouseup", "mouseleave"]) {
            props += ` on${ev}=handleMouse(event,${answerid})`;
        }
        for (let ev of ["touchstart", "touchend", "touchcancel"]) {
            props += ` on${ev}=handleTouch(event,${answerid})`;
        }
        return props;
    };
    let p = () => {
        return `<br><em id=hp${answerid}></em>`;
    };
    if (q[1].startsWith("vote: ")) {
        let h = `<p>Group vote: ${escapehtml(q[1].slice(6))}</p><ol>\n`;
        h += `<li ${a()}>definitely not ${p()}</li>\n`;
        h += `<li ${a()}>can be talked into it ${p()}</li>\n`;
        h += `<li ${a()}>I don't mind trying ${p()}</li>\n`;
        h += `<li ${a()}>definitely yes ${p()}</li>\n`;
        return h + "</ol>";
    }
    if (q[1].startsWith("dare: ")) {
        let h = `<p>Dare: ${escapehtml(q[1].slice(6))}</li><ol>\n`;
        if (name != "")
            h = `<p>Dare against ${name}'s body: ${escapehtml(q[1].slice(6))}</li><ol>\n`;
        h += `<li ${a()}>no ${p()}</li>\n`;
        h += `<li ${a()}>can be talked into it ${p()}</li>\n`;
        h += `<li ${a()}>I don't mind trying ${p()}</li>\n`;
        h += `<li ${a()}>yes ${p()}</li>\n`;
        return h + "</ol>";
    }
    let h = `<p>${escapehtml(q[1])}</p><ol>`;
    if (name != "")
        h = `<p>${name}: ${escapehtml(q[1])}</p><ol>`;
    for (let i = 2; i < q.length; i++)
        h += `<li ${a()}>${escapehtml(q[i])} ${p()}</li>\n`;
    return h + "</ol>";
}
function handlePrint() {
    selectQuestions();
    let h = "";
    for (let q of g.questions) {
        if (g.categories[q[0]])
            h += `<div class=hPrintableCard><span>${makeQuestionHTML(q, "")}\n<p><em>category: ${q[0]}</em></p></span></div>`;
    }
    hPrintable.hidden = false;
    hPrintable.innerHTML = h;
    for (let div of hPrintable.children) {
        let span = div.children[0];
        let [lo, hi] = [25, 200];
        for (let i = 0; i < 5; i++) {
            let mid = (lo + hi) / 2;
            span.style.fontSize = `${mid}%`;
            if (div.scrollWidth <= div.clientWidth && div.scrollHeight <= div.clientHeight) {
                lo = mid;
            }
            else {
                hi = mid;
            }
        }
        span.style.fontSize = `${lo}%`;
    }
    location.hash = "#printable";
}
function handleWeekly() {
    let cats = "";
    for (let cat in g.categories) {
        if (document.getElementById("hq" + cat[0]).checked)
            cats += cat[0];
    }
    if (cats == "")
        cats = "s";
    location.hash = `#weekly-c${cats}`;
}
function setDate(v) {
    let parts = location.hash.split("-").filter((p) => !p.startsWith("d"));
    let d = parseInt(v);
    if (d)
        parts.push(`d${d}`);
    location.replace(parts.join("-"));
    handleHash();
}
function renderWeekly() {
    let cats = "";
    let date = 0;
    let parts = location.hash.split("-");
    parts.shift();
    while (parts.length > 0) {
        let part = parts.shift();
        if (part?.startsWith("c"))
            cats = part.substr(1);
        if (part?.startsWith("d"))
            date = parseInt(part.substr(1));
    }
    if (cats == "")
        cats = "s";
    if (date && hDate.value != `${date}`)
        hDate.value = `${date}`;
    let d = new Date();
    let [yy, mm, dd] = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
    while (new Date(Date.UTC(yy, mm - 1, dd)).getUTCDay() != 1) {
        let d = new Date(Date.UTC(yy, mm - 1, dd - 1));
        [yy, mm, dd] = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
    }
    let lastMonday = (yy % 100) * 10000 + mm * 100 + dd;
    hLastMonday.textContent = `${lastMonday}`;
    if (!date) {
        date = lastMonday;
        hDate.value = `${lastMonday}`;
    }
    shuffle(1);
    let qs = [];
    for (let q of g.shuffledqs) {
        if (cats.includes(q[0][0]))
            qs.push(q);
    }
    hWeeklyCard.innerHTML = `${makeQuestionHTML(qs[date % qs.length], "")}\n<p><em>category: ${qs[date % qs.length][0]}</em></p>`;
}
function handleStart() {
    g.gameSeed = parseInt(hSeed.value);
    g.questionIndex = 0;
    let savegame = localStorage.getItem("awocards.Savegame");
    if (savegame != null) {
        let parts = savegame.split(" ");
        if (parts.length == 2) {
            g.questionIndex = parseInt(parts[0]);
            g.gameSeed = parseInt(parts[1]);
        }
    }
    shuffle(g.gameSeed);
    g.clients = [new client(-1, null, null)];
    g.playerStatuses.clear();
    handleNameChange(hName.value);
    selectQuestions();
    // Continue the game from g.questionIndex.
    if (g.questionIndex > g.shuffledqs.length)
        g.questionIndex = g.shuffledqs.length;
    g.filteredIndex = -1;
    for (let i = 0; i < g.questionIndex; i++) {
        if (g.categories[g.shuffledqs[i][0]])
            g.filteredIndex++;
    }
    g.questionIndex--;
    handleNext();
    handleHost();
}
function handlePrev() {
    if (g.filteredIndex == 0)
        return;
    if (g.clientMode) {
        if (g.clients.length >= 1)
            g.clients[0].channel?.send(`j${g.filteredIndex}`);
        return;
    }
    g.filteredIndex--;
    g.questionIndex--;
    while (g.questionIndex > 0 && !g.categories[g.shuffledqs[g.questionIndex][0]])
        g.questionIndex--;
    g.currentQuestion = g.shuffledqs[g.questionIndex];
    g.currentPos = `card ${g.filteredIndex + 1}/${g.filteredQuestions}`;
    updateCurrentQuestion();
    renderQuestion(rendermode.full);
}
function handleJump(v) {
    let [idx, total] = [parseInt(v), 0];
    if (idx <= 0 || idx > g.filteredQuestions + 1)
        return;
    if (g.clientMode) {
        if (g.clients.length >= 1)
            g.clients[0].channel?.send(`j${idx}`);
        return;
    }
    g.questionIndex = g.shuffledqs.length;
    g.filteredIndex = g.filteredQuestions;
    for (let i = 0; i < g.shuffledqs.length; i++) {
        if (!g.categories[g.shuffledqs[i][0]])
            continue;
        total++;
        if (total == idx) {
            g.filteredIndex = total - 1;
            g.questionIndex = i;
            break;
        }
    }
    updateCurrentQuestion();
    renderQuestion(rendermode.full);
}
function handleNext() {
    if (g.filteredIndex == g.filteredQuestions)
        return;
    if (g.clientMode) {
        if (g.clients.length >= 1)
            g.clients[0].channel?.send(`j${g.filteredIndex + 2}`);
        return;
    }
    g.filteredIndex++;
    g.questionIndex++;
    while (g.questionIndex < g.shuffledqs.length && !g.categories[g.shuffledqs[g.questionIndex][0]])
        g.questionIndex++;
    updateCurrentQuestion();
    renderQuestion(rendermode.full);
}
function reportClick(v) {
    if (v <= 7 && g.disableInteraction) {
        g.downbutton = 0;
        return;
    }
    let st = g.playerStatuses.get(hName.value);
    if (st == undefined)
        return;
    let r = st.response;
    if ((v & responsebits.answermask) > 0) {
        // This is an answer click.
        // Already answered? Clear answer then, otherwise set it.
        if ((st.response & responsebits.answermask) > 0) {
            r &= ~responsebits.answermask;
        }
        else {
            r = (r & ~responsebits.answermask) | v;
        }
    }
    else {
        // Otherwise this is a status click.
        r ^= v;
    }
    g.downbutton = 0;
    g.sentStatus = r;
    if (g.clientMode) {
        if (g.clients.length >= 1)
            g.clients[0].channel?.send(`r${r}`);
    }
    else {
        st.response = r;
        updatePlayerStatus();
    }
}
function countPlayers() {
    let c = 0;
    g.playerStatuses.forEach((st) => {
        if (st.active)
            c++;
    });
    return c;
}
function handleMouse(event, v) {
    if (g.downbutton == 0 && (event.type == "mouseleave" || event.type == "mouseup"))
        return;
    if (event.type == "mouseleave") {
        g.downbutton = 0;
        renderQuestion(rendermode.quick);
        return;
    }
    if (event.button != 0)
        return;
    if (v == g.downbutton && event.type == "mouseup") {
        reportClick(v);
    }
    else if (event.type == "mousedown" && (v >= 8 || !g.disableInteraction)) {
        g.downbutton = v;
    }
    renderQuestion(rendermode.quick);
}
function handleTouch(event, v) {
    event.stopPropagation();
    event.preventDefault();
    if (event.type == "touchstart" && (v >= 8 || !g.disableInteraction)) {
        g.downbutton = v;
    }
    else if (event.type == "touchcancel") {
        g.downbutton = 0;
    }
    else if (event.type == "touchend") {
        reportClick(v);
    }
    renderQuestion(rendermode.quick);
}
function handleKick() {
    reportClick(responsebits.kickmarker);
}
function updateCurrentQuestion() {
    // Reset responses.
    g.playerStatuses.forEach((st) => (st.response = responsebits.empty));
    g.sentStatus = responsebits.empty;
    updatePlayerStatus();
    if (g.questionIndex == g.shuffledqs.length) {
        g.currentQuestion = ["none", "vote: Game over because out of questions. Play again with spicier categories?"];
    }
    else {
        g.currentQuestion = g.shuffledqs[g.questionIndex];
    }
    g.currentPos = `card ${g.filteredIndex + 1}/${g.filteredQuestions}`;
    for (let c of g.clients)
        c.channel?.send("q" + [`${g.filteredIndex}`, `${g.filteredQuestions}`].concat(g.currentQuestion).join("@"));
    localStorage.setItem("awocards.Savegame", `${g.questionIndex} ${g.gameSeed}`);
    // Remove inactive players here, good point as any.
    g.playerStatuses.forEach((st, name) => {
        if (!st.active)
            g.playerStatuses.delete(name);
    });
}
function updatePlayerStatus() {
    if (g.clientMode) {
        g.answerer = "";
        g.playerStatuses.forEach((st, name) => {
            if (st.active && st.response & responsebits.answerermarker)
                g.answerer = name;
        });
        return;
    }
    g.playerStatuses.forEach((st) => (st.active = false));
    for (let c of g.clients) {
        if (c.networkStatus == "" && c.username != "") {
            let st = g.playerStatuses.get(c.username);
            if (st != undefined) {
                st.active = true;
            }
            else {
                g.playerStatuses.set(c.username, new userstatus());
            }
        }
    }
    let statusmsg = [];
    let [nextcnt, kickcnt] = [0, 0];
    g.answerer = "";
    g.playerStatuses.forEach((st, name) => {
        if (st.active)
            statusmsg.push(`${name} ${st.response}`);
        if (st.active && (st.response & responsebits.answerermarker) > 0)
            g.answerer = name;
        if (st.active && (st.response & responsebits.nextmarker) > 0)
            nextcnt++;
        if (st.active && (st.response & responsebits.kickmarker) > 0)
            kickcnt++;
    });
    statusmsg.sort((a, b) => {
        if (a < b)
            return -1;
        if (a > b)
            return +1;
        return 0;
    });
    let msg = "p" + statusmsg.join("@");
    for (let c of g.clients)
        c.channel?.send(msg);
    if (nextcnt >= 2)
        handleNext();
    if (kickcnt >= 2) {
        let hostkicked = false;
        for (let c of g.clients) {
            if (c.username == "")
                continue;
            let st = g.playerStatuses.get(c.username);
            if (st == null || (st.response & responsebits.answermask) > 0 || (st.response & responsebits.answerermarker) > 0)
                continue;
            c.username = "";
            if (c == g.clients[0]) {
                hostkicked = true;
            }
            else {
                c.channel?.send("k");
            }
        }
        g.sentStatus = g.sentStatus & ~responsebits.kickmarker;
        g.playerStatuses.forEach((st) => {
            st.response = st.response & ~responsebits.kickmarker;
        });
        updatePlayerStatus();
        if (hostkicked)
            alert("You have been kicked out of the game due to inactivity. Reload the game to rejoin.");
    }
}
function renderStatus() {
    let stat = `${g.currentPos}, category ${g.currentQuestion[0]}`;
    let isplayer = g.playerStatuses.has(hName.value);
    let playercnt = 0;
    g.playerStatuses.forEach((st, name) => {
        if (st.active)
            playercnt++;
    });
    if (g.clientMode || g.clients.length >= 2) {
        if (g.clients.length == 0) {
            stat += ", no connection (try reloading)";
        }
        else if (hName.value == "") {
            stat += ", you are spectating because you have not set a username";
        }
        else if (!isplayer) {
            stat += ", you are spectating because you were kicked";
        }
        else {
            stat += ", your username is " + hName.value;
        }
    }
    if (!g.clientMode) {
        let [clients, players, spectators, pending] = [0, 0, 0, 0];
        let clientcnt = new Map();
        for (let c of g.clients) {
            if (c.networkStatus != "" && c.conn != null)
                pending++;
            if (c.networkStatus == "" && c.username == "")
                spectators++;
            if (c.networkStatus == "" && c.username != "")
                clientcnt.set(c.username, (clientcnt.get(c.username) ?? 0) + 1);
        }
        g.playerStatuses.forEach((st) => {
            if (st.active)
                players++;
        });
        let multiclientusers = [];
        clientcnt.forEach((cnt, u) => {
            clients += cnt;
            if (cnt >= 2)
                multiclientusers.push(u);
        });
        if (g.clients.length >= 2) {
            if (g.clients[0].username == "")
                spectators--;
            if (spectators > 0)
                stat += `, ${spectators} spectators`;
            if (players > 0)
                stat += `, ${players} players`;
            if (clients != players)
                stat += `, ${clients} clients <span class=cfgNegative>(user(s) ${multiclientusers.join(", ")} have multiple!)</span>`;
            if (pending > 0)
                stat += `, ${pending} pending`;
        }
    }
    hStat.innerHTML = stat;
}
var rendermode;
(function (rendermode) {
    rendermode[rendermode["quick"] = 0] = "quick";
    rendermode[rendermode["full"] = 1] = "full";
})(rendermode || (rendermode = {}));
let lastRenderedName = "";
function renderQuestion(mode) {
    renderStatus();
    if (g.currentQuestion.length == 0) {
        hQuestion.textContent = "loading...";
        return;
    }
    // Not connected to host yet, that's the only case where the clients array can be empty.
    // Ignore that, the interface doesn't have to be interactible in that case.
    if (g.clients.length == 0) {
        return;
    }
    let isdare = g.currentQuestion[1].startsWith("dare: ");
    let isvote = g.currentQuestion[1].startsWith("vote: ");
    let isquestion = !isdare && !isvote;
    // Collect various data from which to compute and render the current game status.
    let revealed = false;
    let bgclass = "";
    let allanswers = [];
    let playercnt = 0;
    let [answerer, answer, answererResponse] = ["", 0, 0];
    let isplayer = g.playerStatuses.has(hName.value);
    let playeranswer = 0;
    let playerresponse = 0;
    let pendingPlayers = 0;
    let revealcnt = 0;
    g.playerStatuses.forEach((st, name) => {
        if (st.active)
            playercnt++;
        if (st.active && (st.response & responsebits.answermask) > 0)
            allanswers.push(st.response & responsebits.answermask);
        if (st.active && (st.response & responsebits.answerermarker) != 0) {
            ;
            [answerer, answer, answererResponse] = [name, st.response & responsebits.answermask, st.response];
        }
        if (st.active && name == hName.value)
            playerresponse = st.response;
        if (st.active && (st.response & responsebits.answermask) > 0 && name == hName.value)
            playeranswer = st.response & responsebits.answermask;
        if (st.active && name != answerer && (st.response & responsebits.answermask) == 0)
            pendingPlayers++;
        if (st.active && (st.response & responsebits.revealmarker) > 0)
            revealcnt++;
    });
    let isanswerer = hName.value != "" && hName.value == answerer;
    let isspectator = !isplayer;
    // Render the question.
    if (mode == rendermode.full || answerer != lastRenderedName) {
        if ("wakeLock" in navigator)
            navigator.wakeLock.request("screen");
        lastRenderedName = answerer;
        let a = playercnt >= 2 && answerer == "" ? "?" : answerer;
        hQuestion.innerHTML = makeQuestionHTML(g.currentQuestion, a);
        g.fontsize = 300;
        hGameScreen.style.fontSize = `300px`;
    }
    // Compute the hGroupControl visibility status and its text.
    let answererText = "";
    hNavbar.hidden = isplayer && playercnt >= 2;
    hGroupControl.hidden = true;
    hStatusbox.hidden = true;
    hPlayers.hidden = true;
    if (playercnt >= 2 && !isplayer) {
        hStatusbox.hidden = false;
        hPlayers.hidden = false;
    }
    else if (playercnt >= 2) {
        hGroupControl.hidden = false;
        hStatusbox.hidden = false;
        hBecomeAnswerer.hidden = !((isquestion || isdare) && (answerer == "" || isanswerer));
        hRevealMarker.hidden = !(pendingPlayers > 0 && (isvote || (isdare && answerer != "") || (isquestion && answer != 0)));
        hPlayers.hidden = false;
        hRevealMarker.textContent = `${(playerresponse & responsebits.revealmarker) > 0 ? "[x]" : "[ ]"} skip wait (needs 2 players)`;
        hNextMarker.textContent = `${(playerresponse & responsebits.nextmarker) > 0 ? "[x]" : "[ ]"} next question (needs 2 players)`;
        let answerertype = isdare ? "receiver" : "answerer";
        hBecomeAnswerer.textContent = `${answerer == hName.value ? "[x]" : "[ ]"} become ${answerertype}`;
        hBecomeAnswerer.className = g.downbutton == responsebits.answerermarker ? "cfgNeutral" : "";
        hNextMarker.className = g.downbutton == responsebits.nextmarker ? "cfgNeutral" : "";
        hRevealMarker.className = g.downbutton == responsebits.revealmarker ? "cfgNeutral" : "";
    }
    hKickLine.hidden = playercnt <= 1;
    hKick.checked = (playerresponse & responsebits.kickmarker) > 0;
    // Compute each player's statusbox.
    g.disableInteraction = !isplayer || playercnt <= 1 || (isanswerer && isdare);
    if (playercnt >= 2) {
        let status = statusdescs.empty;
        if (isquestion) {
            if (answerer == "") {
                status = statusdescs.questionvolunteer;
                g.disableInteraction = true;
            }
            else if (isplayer && playeranswer == 0 && isanswerer) {
                status = statusdescs.respond;
            }
            else if (isplayer && playeranswer == 0) {
                status = statusdescs.guess;
            }
            else if (answer == 0 || (pendingPlayers > 0 && revealcnt <= 1)) {
                status = statusdescs.wait;
            }
            else if ((isanswerer || !isplayer) && allanswers.every((v) => v == answer)) {
                status = statusdescs.congrats;
                revealed = true;
            }
            else if (isanswerer || !isplayer) {
                status = statusdescs.interrogate;
                revealed = true;
            }
            else if (playeranswer == answer) {
                status = statusdescs.correct;
                revealed = true;
            }
            else {
                status = statusdescs.wrong;
                revealed = true;
            }
        }
        if (isvote) {
            let [mn, mx] = [Math.min(...allanswers), Math.max(...allanswers)];
            let ok = mn >= 3 || (mn >= 2 && mx == 4);
            if (isplayer && playeranswer == 0) {
                status = statusdescs.respond;
            }
            else if (pendingPlayers > 0 && revealcnt <= 1) {
                status = statusdescs.wait;
            }
            else if (ok) {
                status = statusdescs.plan;
                revealed = true;
            }
            else {
                status = statusdescs.skip;
                revealed = true;
            }
        }
        if (isdare) {
            let hasvolunteer = allanswers.some((v) => v >= 2);
            if (answerer == "") {
                status = statusdescs.darevolunteer;
                g.disableInteraction = true;
            }
            else if (isplayer && !isanswerer && playeranswer == 0) {
                status = statusdescs.respond;
            }
            else if (pendingPlayers > 0 && revealcnt <= 1) {
                status = statusdescs.wait;
            }
            else if (hasvolunteer && isanswerer) {
                status = statusdescs.pick;
                revealed = true;
            }
            else if (hasvolunteer) {
                status = statusdescs.watch;
                revealed = true;
            }
            else {
                status = statusdescs.skip;
                revealed = true;
            }
        }
        if (playerresponse != g.sentStatus)
            status = statusdescs.network;
        hStatusMarker.innerHTML = `${status.emoji} ${status.tag}<br><span class=cInitialSize>${status.desc}</span>`;
    }
    // Render the emoji coded player status line.
    let players = [];
    g.playerStatuses.forEach((st, name) => {
        if (!st.active)
            return;
        let panswer = st.response & responsebits.answermask;
        if (!revealed) {
            if (isdare && name == answerer) {
                players.push(`${name} 👋`);
            }
            else if (panswer == 0) {
                players.push(`${name} 🎲`);
            }
            else {
                players.push(`${name} ⌛`);
            }
            return;
        }
        if (revealed && isvote) {
            if (panswer == 0) {
                players.push(`${name} 🎲`);
            }
            else if (panswer == 1) {
                players.push(`${name} ❌`);
            }
            else {
                players.push(`${name} ✅`);
            }
            return;
        }
        if (revealed && isdare) {
            if (name == answerer) {
                players.push(`${name} 👋`);
            }
            else if (panswer == 0) {
                players.push(`${name} 🎲`);
            }
            else if (panswer == 1) {
                players.push(`${name} ❌`);
            }
            else {
                players.push(`${name} ✅`);
            }
            return;
        }
        if (panswer == 0) {
            players.push(`${name} 🎲`);
        }
        else if (name == answerer) {
            players.push(`${name} 👋`);
        }
        else if (panswer == answer) {
            players.push(`${name} ✅`);
        }
        else {
            players.push(`${name} ❌`);
        }
    });
    players.sort();
    hPlayers.innerHTML = "Players: " + players.join(", ");
    // Render player names if revealed.
    let answerNames = [[], [], [], [], []];
    if (revealed) {
        g.playerStatuses.forEach((st, name) => {
            if (isdare && name == answerer)
                return;
            if (st.active)
                answerNames[st.response & responsebits.answermask].push(name);
        });
    }
    for (let i = 1; i <= 4; i++) {
        let e = document.getElementById(`hp${i}`);
        answerNames[i].sort();
        let namelist = "&nbsp;";
        if (answerNames[i].length > 0)
            namelist = `[${answerNames[i].join(", ")}]`;
        if (e != null)
            e.innerHTML = namelist;
    }
    // Color answers as needed.
    let answerClass = ["", "", "", "", "", ""];
    if (isquestion && revealed) {
        answerClass[answer] = "cfgPositive";
        if (playeranswer != answer)
            answerClass[playeranswer] = "cfgNegative";
    }
    if (g.downbutton < 4)
        answerClass[g.downbutton] = "cfgNeutral";
    for (let id = 1; id <= 4; id++) {
        let elem = document.getElementById(`ha${id}`);
        if (elem != null)
            elem.className = answerClass[id];
    }
    // Shrink to fit.
    let [w, h] = [innerWidth, 0.9 * innerHeight];
    if (g.fontsize >= 14 && (hGameUI.scrollWidth + hGameUI.offsetLeft > w || hGameUI.scrollHeight + hGameUI.offsetTop > h)) {
        let [lo, hi] = [12, g.fontsize];
        for (let it = 0; it < 8; it++) {
            let mid = (lo + hi) / 2;
            g.fontsize = mid;
            hGameScreen.style.fontSize = `${g.fontsize}px`;
            if (hGameUI.scrollWidth + hGameUI.offsetLeft > w || hGameUI.scrollHeight + hGameUI.offsetTop > h) {
                hi = mid;
            }
            else {
                lo = mid;
            }
        }
        g.fontsize = lo;
        hGameScreen.style.fontSize = `${g.fontsize}px`;
    }
}
function disconnectAll() {
    g.aborter?.abort();
    g.clientMode = false;
    for (let c of g.clients) {
        if (c.conn != null) {
            if (c.channel != null) {
                c.channel.onmessage = null;
                c.channel.send("x");
                c.channel = null;
            }
            c.conn.oniceconnectionstatechange = null;
            c.conn.close();
            c.conn = null;
        }
    }
    g.clients = [];
}
function handleHash() {
    // Close all connections.
    disconnectAll();
    hQuestion.innerHTML = "";
    hIntro.hidden = true;
    hSeedPreview.hidden = true;
    hPrintable.hidden = true;
    hGameUI.hidden = true;
    hWeeklyUI.hidden = true;
    hHostGameLine.hidden = true;
    document.body.className = "";
    if (location.hash == "#preview") {
        handleSeedPreview();
        hSeedPreview.hidden = false;
        return;
    }
    if (location.hash == "#printable") {
        handlePrint();
        hPrintable.hidden = false;
        return;
    }
    if (location.hash == "#restart") {
        localStorage.removeItem("awocards.Savegame");
        location.replace("#play");
    }
    if (location.hash == "#play") {
        hHostGameLine.hidden = false;
        handleStart();
        hGameUI.hidden = false;
        renderQuestion(rendermode.full);
        return;
    }
    if (location.hash.startsWith("#join-")) {
        hGameUI.hidden = false;
        hJoiningMessage.textContent = "Joining...";
        hJoining.hidden = false;
        hGameUI.hidden = true;
        join();
        return;
    }
    if (location.hash.startsWith("#weekly-")) {
        hWeeklyUI.hidden = false;
        renderWeekly();
        return;
    }
    hIntro.hidden = false;
}
function handleMarkerClick(bit) {
    // Find current response.
    let response = null;
    let st = g.playerStatuses.get(hName.value);
    if (g.clients.length == 0 || st == null)
        return;
    if (g.clientMode) {
        g.clients[0].channel?.send(`r${st.response ^ bit}`);
    }
    else {
        st.response ^= bit;
        updatePlayerStatus();
        renderQuestion(rendermode.quick);
    }
}
function handleFullscreen() {
    // Ignore errors, we don't care.
    if (hFullscreen.checked) {
        document.documentElement.requestFullscreen().catch(() => { });
    }
    else {
        document.exitFullscreen().catch(() => { });
    }
    renderQuestion(rendermode.full);
}
// Parses data into g.questionsDB.
// Returns an error message if there were errors, an empty string otherwise.
function handleParse() {
    let data = questionsdata;
    if (hCustomDB.checked)
        data = hCustomText.value;
    let category = "unset-category";
    let invalidCategories = new Set();
    let badcards = 0;
    let badcard = "";
    let badreason = "";
    let qs = [];
    let knownCategories = new Set();
    for (let cat in g.categories)
        knownCategories.add(cat);
    for (let line of data.split("\n")) {
        let hashidx = line.indexOf("#");
        if (hashidx != -1)
            line = line.slice(0, hashidx);
        line = line.trim();
        if (line == "")
            continue;
        if (line.startsWith("@")) {
            category = line.substr(1);
            if (!knownCategories.has(category))
                invalidCategories.add(category);
            continue;
        }
        let parts = line.split("@");
        for (let i in parts)
            parts[i] = parts[i].trim();
        let special = parts[0].startsWith("dare: ") || parts[0].startsWith("vote: ");
        if (!knownCategories.has(category)) {
            badcards++;
            badcard = line;
            badreason = "invalid category";
        }
        else if (special && parts.length != 1) {
            badcards++;
            badcard = line;
            badreason = "needs no answers";
        }
        else if (!special && !(2 <= parts.length - 1 && parts.length - 1 <= 4)) {
            badcards++;
            badcard = line;
            badreason = `got ${parts.length - 1} answers, want 2-4`;
        }
        else {
            qs.push([category].concat(parts));
        }
    }
    g.questions = qs;
    let err = "";
    if (invalidCategories.size > 0) {
        err = `found invalid categories: ${Array.from(invalidCategories.values()).join(", ")}`;
    }
    else if (badcards > 0) {
        err = `found ${badcards} bad cards, last one is "${badcard}", reason: ${badreason}`;
    }
    if (!hCustomDB.checked) {
        hCustomQuestionsReport.textContent = "";
        if (err != "")
            seterror(err);
    }
    else {
        if (err != "") {
            hCustomQuestionsReport.textContent = `Error: ${err}.`;
        }
        else {
            hCustomQuestionsReport.textContent = `Found ${qs.length} entries.`;
        }
    }
}
// Convert continuation passing style into direct style:
// await eventPromise(obj, 'click') will wait for a single click on obj.
function eventPromise(obj, eventName) {
    return new Promise((resolve) => {
        let handler = (event) => {
            obj.removeEventListener(eventName, handler);
            resolve(event);
        };
        obj.addEventListener(eventName, handler);
    });
}
function handleJoinnameChange(s) {
    if (s != "" && !validateName(s)) {
        hJoinname.className = "cbgNegative";
        hJoinnameErr.textContent = "invalid name, must be at most 12 alphanumeric characters";
        s = "";
    }
    else {
        hJoinname.className = "";
        hJoinnameErr.textContent = "";
    }
    hName.value = s;
    localStorage.setItem("awocards.Username", s);
    hJoinButton.textContent = hJoinname.value == "" ? "Spectate" : "Join";
    hJoinButton.disabled = hJoincode.value == "";
}
function handleNameChange(s) {
    if (s != "" && !validateName(s)) {
        hName.className = "cbgNegative";
        hNameErr.textContent = "invalid name, must be at most 12 alphanumeric characters";
        s = "";
    }
    else {
        hName.className = "";
        hNameErr.textContent = "";
    }
    hJoinname.value = s;
    localStorage.setItem("awocards.Username", s);
    if (g.clientMode) {
        if (g.clients.length >= 1)
            g.clients[0].channel?.send("n" + s);
        return;
    }
    if (g.clients.length > 0)
        g.clients[0].username = s;
    updatePlayerStatus();
    renderQuestion(rendermode.quick);
}
const signalingServer = "https://iio.ie/sig";
const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
function renderNetworkStatus() {
    if (g.clientMode) {
        hNetwork.hidden = false;
        if (g.networkStatus != "") {
            hNetwork.textContent = "Network status: " + g.networkStatus;
        }
        else {
            hNetwork.textContent = "Network status: connected";
        }
        return;
    }
    let parts = [];
    if (g.networkStatus != "")
        parts.push(g.networkStatus);
    for (let c of g.clients) {
        if (c.networkStatus != "")
            parts.push(`client ${c.clientID}: ${c.networkStatus}`);
    }
    if (parts.length != 0) {
        hNetwork.hidden = false;
        hNetwork.textContent = "Network status: " + parts.join("; ");
    }
    else {
        hNetwork.hidden = true;
    }
    renderStatus();
}
function setNetworkStatus(s) {
    g.networkStatus = s;
    if (hJoiningMessage.textContent != "")
        hJoiningMessage.textContent = "Joining: " + s;
    renderNetworkStatus();
}
async function connectToClient(hostcode, clientID) {
    // Create a description offer and upload it to the signaling service.
    let response;
    let conn = new RTCPeerConnection(rtcConfig);
    let channel = conn.createDataChannel("datachannel");
    let c = new client(clientID, conn, null);
    g.clients.push(c);
    let updateStatus = (msg) => {
        c.networkStatus = msg;
        renderNetworkStatus();
    };
    let error = async (msg) => {
        updateStatus(msg);
        conn.oniceconnectionstatechange = null;
        channel.onmessage = null;
        conn.close();
        c.conn = null;
        c.channel = null;
        renderStatus();
        await new Promise((resolve) => setTimeout(resolve, 5000));
        g.clients.splice(g.clients.indexOf(c), 1);
        renderNetworkStatus();
    };
    conn.oniceconnectionstatechange = async (ev) => {
        if (conn.iceConnectionState != "disconnected")
            return;
        error(`error: lost connection to ${c.username == "" ? "a spectator" : c.username}`);
        updatePlayerStatus();
        renderQuestion(rendermode.full);
    };
    channel.onmessage = async (ev) => {
        let msg = ev.data;
        if (msg.length == 0)
            return;
        let param = msg.substr(1);
        switch (msg[0]) {
            case "j":
                handleJump(param);
                break;
            case "l":
                console.log("Client log request:", param);
                return;
            case "n":
                if (!validateName(param))
                    param = "";
                c.username = param;
                updatePlayerStatus();
                renderQuestion(rendermode.full);
                break;
            case "r":
                let r = parseInt(param);
                if (r != r || c.username == "")
                    break;
                let st = g.playerStatuses.get(c.username);
                if (st != undefined) {
                    // Clear the answerer bit from the response if some other player is already the answerer.
                    if ((r & responsebits.answerermarker) > 0 && g.answerer != "" && g.answerer != c.username)
                        r &= ~responsebits.answerermarker;
                    st.response = r;
                }
                updatePlayerStatus();
                renderQuestion(rendermode.quick);
                break;
            case "x":
                error(`${c.username == "" ? "a spectator" : c.username} exited`);
                updatePlayerStatus();
                renderQuestion(rendermode.full);
                break;
            default:
                console.log("Unhandled message:", msg);
                break;
        }
    };
    updateStatus("creating local offer");
    let offer = await conn.createOffer();
    conn.setLocalDescription(offer);
    updateStatus("awaiting iceGatherState completion");
    do {
        await eventPromise(conn, "icegatheringstatechange");
    } while (conn.iceGatheringState != "complete");
    updateStatus("uploading offer");
    try {
        response = await fetch(`${signalingServer}?set=awocards-${hostcode}-${clientID}-offer&timeoutms=5000`, {
            method: "POST",
            body: conn.localDescription?.sdp,
        });
    }
    catch (e) {
        error(`error: upload offer: ${e} (client has to try again)`);
        return;
    }
    if (response.status != 200) {
        error("error: ${response.status}: client didn't read offer");
        return;
    }
    // Establish the connection to the connecting client.
    updateStatus("awaiting client's answer");
    try {
        response = await fetch(`${signalingServer}?get=awocards-${hostcode}-${clientID}-answer&timeoutms=5000`, { method: "POST" });
    }
    catch (e) {
        error(`error: await client's answer: ${e} (client has to try again)`);
        return;
    }
    if (response.status != 200) {
        error(`error: ${response.status}: client didn't answer (client has to try again)`);
        return;
    }
    let sdp = await response.text();
    conn.setRemoteDescription({ type: "answer", sdp: sdp });
    updateStatus("establishing connection");
    await eventPromise(channel, "open");
    c.channel = channel;
    updateStatus("");
    channel.send(`v${version}`);
    channel.send("q" + [`${g.filteredIndex}`, `${g.filteredQuestions}`].concat(g.currentQuestion).join("@"));
}
async function handleHost() {
    if (!hHostGame.checked) {
        g.aborter?.abort();
        setNetworkStatus("");
        hHostcode.disabled = false;
        hHostURL.hidden = true;
        return;
    }
    let hostcode = hHostcode.value;
    localStorage.setItem("awocards.Hostcode", hHostcode.value);
    let href = location.origin + location.pathname + `#join-${hostcode}`;
    hHostcode.disabled = true;
    hHostURL.innerHTML = `<br>join link: <a href='${href}'>${href}</a>`;
    hHostURL.hidden = false;
    setNetworkStatus("initializing");
    g.aborter = new AbortController();
    let aborter = g.aborter;
    for (let clientID = 1;; clientID++) {
        if (aborter.signal.aborted) {
            return;
        }
        let response;
        // Advertise the next client ID.
        setNetworkStatus("waiting for next client");
        try {
            response = await fetch(`${signalingServer}?set=awocards-${hostcode}-nextid`, {
                method: "POST",
                body: `${clientID}`,
                signal: aborter.signal,
            });
        }
        catch (e) {
            if (aborter.signal.aborted) {
                return;
            }
            setNetworkStatus(`error: upload offer to signaling server: ${e} (will try again soon)`);
            await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
            continue;
        }
        if (response.status == 409) {
            setNetworkStatus(`error: code already taken by another server (will try again soon though)`);
            await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
            continue;
        }
        if (response.status == 204) {
            continue;
        }
        if (response.status != 200) {
            let body = await response.text();
            setNetworkStatus(`error: upload offer to signaling server: ${response.status}: ${body} (will try again soon)`);
            await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
            continue;
        }
        let id = clientID;
        setTimeout(() => {
            connectToClient(hostcode, id);
        }, 0);
    }
}
function handleJoin() {
    if (hJoincode.value == "" || hJoincode.value.startsWith("-"))
        return;
    location.hash = "#join-" + hJoincode.value;
}
async function join() {
    let joincode = location.hash.substr(6);
    localStorage.setItem("awocards.Joincode", joincode);
    g.clientMode = true;
    g.playerStatuses.clear();
    g.aborter = new AbortController();
    let aborter = g.aborter;
    while (true) {
        let jointime = Date.now();
        let response;
        setNetworkStatus("awaiting server's signal");
        try {
            response = await fetch(`${signalingServer}?get=awocards-${joincode}-nextid&timeoutms=600000`, { method: "POST" });
        }
        catch (e) {
            setNetworkStatus(`error: await server's signal: ${e} (will try again soon`);
            await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
            continue;
        }
        if (response.status == 204) {
            continue;
        }
        if (response.status != 200) {
            let body = await response.text();
            setNetworkStatus(`error: wait server's signal: ${body} (will try again soon)`);
            await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
            continue;
        }
        let clientID = await response.text();
        setNetworkStatus("awaiting server's offer");
        try {
            response = await fetch(`${signalingServer}?get=awocards-${joincode}-${clientID}-offer&timeoutms=5000`, { method: "POST" });
        }
        catch (e) {
            setNetworkStatus(`error: wait server's offer: ${e} (will try again soon`);
            await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
            continue;
        }
        if (response.status != 200) {
            let body = await response.text();
            setNetworkStatus(`error: wait server's offer: ${response.status}: ${body} (will try again soon)`);
            await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
            continue;
        }
        let offer = await response.text();
        let conn = new RTCPeerConnection(rtcConfig);
        conn.onicecandidateerror = async (ev) => {
            conn.oniceconnectionstatechange = null;
            conn.close();
            g.clients = [];
            setNetworkStatus(`error: failed to connect: ${ev.errorText}`);
            if (Date.now() - jointime < 60000) {
                // Avoid rapid retrying.
                await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
            }
            join();
        };
        conn.oniceconnectionstatechange = async (ev) => {
            if (conn.iceConnectionState != "disconnected")
                return;
            conn.oniceconnectionstatechange = null;
            conn.close();
            g.clients = [];
            setNetworkStatus("error: lost connection (will try reconnecting soon)");
            if (Date.now() - jointime < 60000) {
                // Avoid rapid retrying.
                await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
            }
            join();
        };
        conn.ondatachannel = (ev) => {
            let channel = ev.channel;
            if (aborter?.signal.aborted) {
                channel.send("x");
                conn.close();
                return;
            }
            g.clients = [new client(0, conn, channel)];
            hJoiningMessage.textContent = "";
            hJoining.hidden = true;
            hGameUI.hidden = false;
            handleNameChange(hName.value);
            channel.onmessage = async (ev) => {
                let msg = ev.data;
                if (msg.length == 0)
                    return;
                let [cmd, param] = [msg[0], msg.slice(1)];
                switch (cmd) {
                    case "k":
                        alert("You have been kicked out of the game due to inactivity. Reload the game to rejoin.");
                        g.sentStatus = 0;
                        return;
                    case "l":
                        console.log("Host log request:", param);
                        return;
                    case "p":
                        g.playerStatuses.clear();
                        g.sentStatus = 0; // pre-clear for the kicked out player case.
                        for (let s of param.split("@")) {
                            let sp = s.split(" ");
                            if (sp.length != 2)
                                continue;
                            let st = new userstatus();
                            st.response = parseInt(sp[1]);
                            if (!st.response)
                                st.response = 0;
                            g.playerStatuses.set(sp[0], st);
                            if (sp[0] == hName.value)
                                g.sentStatus = st.response;
                        }
                        updatePlayerStatus();
                        renderQuestion(rendermode.full);
                        return;
                    case "q":
                        let parts = param.split("@");
                        if (parts.length <= 3)
                            return;
                        [g.filteredIndex, g.filteredQuestions] = [parseInt(parts[0]), parseInt(parts[1])];
                        g.currentPos = `card ${g.filteredIndex + 1}/${g.filteredQuestions}`;
                        g.currentQuestion = parts.slice(2);
                        renderQuestion(rendermode.full);
                        return;
                    case "v":
                        let hostversion = parseInt(param);
                        if (version != hostversion) {
                            location.replace(`${location.origin}/v${param}.html${location.hash}`);
                        }
                        return;
                    case "x":
                        conn.oniceconnectionstatechange = null;
                        channel.onmessage = null;
                        conn.close();
                        g.clients = [];
                        setNetworkStatus("error: host abandoned the game (will try reconnecting soon)");
                        renderQuestion(rendermode.quick);
                        if (Date.now() - jointime < 60000) {
                            // Avoid rapid retrying.
                            await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
                        }
                        join();
                        return;
                    default:
                        console.log("Unhandled message:", msg);
                        break;
                }
            };
        };
        setNetworkStatus("awaiting iceGatherState completion");
        await conn.setRemoteDescription({ type: "offer", sdp: offer });
        conn.setLocalDescription(await conn.createAnswer());
        do {
            await eventPromise(conn, "icegatheringstatechange");
        } while (conn.iceGatheringState != "complete");
        setNetworkStatus("sending answer");
        try {
            response = await fetch(`${signalingServer}?set=awocards-${joincode}-${clientID}-answer`, {
                method: "POST",
                body: conn.localDescription?.sdp,
            });
        }
        catch (e) {
            setNetworkStatus("error: send answer: ${e} (will try again soon)");
            await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
            continue;
        }
        if (response.status != 200) {
            let body = await response.text();
            setNetworkStatus(`error: send answer: ${response.status}: ${body} (will try again soon)`);
            await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10));
            continue;
        }
        break;
    }
    setNetworkStatus("awaiting connection");
}
let darkPreference = matchMedia("(prefers-color-scheme:dark)");
function setTheme() {
    if (hThemeDark.checked || (hThemeSystem.checked && darkPreference.matches)) {
        document.documentElement.style.colorScheme = "dark";
        document.documentElement.setAttribute("data-theme", "dark");
    }
    else {
        document.documentElement.style.colorScheme = "light";
        document.documentElement.setAttribute("data-theme", "light");
    }
    if (hThemeDark.checked) {
        localStorage.setItem("awocards.Theme", "dark");
    }
    else if (hThemeLight.checked) {
        localStorage.setItem("awocards.Theme", "light");
    }
    else {
        localStorage.removeItem("awocards.Theme");
    }
}
function seterror(msg) {
    hError.textContent = `Error: ${msg}.\nReload the page to try again.`;
    hError.hidden = false;
    document.body.classList.add("cbgNeutral");
}
function main() {
    hNeedJS.hidden = true;
    window.onerror = (msg, src, line) => seterror(`${src}:${line} ${msg}`);
    window.onunhandledrejection = (e) => seterror(e.reason);
    window.onhashchange = handleHash;
    window.onbeforeunload = disconnectAll;
    window.onresize = () => {
        if (location.hash == "#play" || location.hash.startsWith("#join-"))
            renderQuestion(rendermode.full);
    };
    let vmatch = location.pathname.match(/v([0-9]+).html$/);
    if (vmatch)
        version = parseInt(vmatch[1]);
    let path = location.pathname;
    hQuestionsLink.href = `v${version}.js`;
    hGameVersion.textContent = `Game version: v${version}`;
    if (version != 0) {
        hGameVersion.innerHTML = `Game version: v${version} (dev version at <a href=/v0.html>/v0.html</a>)`;
    }
    darkPreference.addEventListener("change", setTheme);
    setTheme();
    let ss = new CSSStyleSheet();
    ss.replace(style);
    document.adoptedStyleSheets.push(ss);
    let addToggleHandlers = (h, v) => {
        h.onmousedown = (event) => handleMouse(event, v);
        h.onmouseup = (event) => handleMouse(event, v);
        h.onmouseleave = (event) => handleMouse(event, v);
        h.ontouchstart = (event) => handleTouch(event, v);
        h.ontouchend = (event) => handleTouch(event, v);
        h.ontouchcancel = (event) => handleTouch(event, v);
    };
    addToggleHandlers(hBecomeAnswerer, responsebits.answerermarker);
    addToggleHandlers(hRevealMarker, responsebits.revealmarker);
    addToggleHandlers(hNextMarker, responsebits.nextmarker);
    // Init category names.
    for (let cat of ["softball", "divisive", "intimate", "partner", "light-dares", "hot-dares", "activities", "naughty-activities"]) {
        g.categories[cat] = false;
    }
    // Init seed with current day.
    let now = new Date();
    hSeed.value = `${(now.getMonth() + 1) * 100 + now.getDate()}`;
    // Load custom questions from localstorage if there are some.
    let storedQuestions = localStorage.getItem("awocards.CustomQuestions");
    if (storedQuestions != null)
        hCustomText.value = storedQuestions;
    // Load or generate host code.
    let storedHostcode = localStorage.getItem("awocards.Hostcode");
    if (storedHostcode == null && hHostcode.value == "") {
        let hostcode = Math.round(1000 + Math.random() * (9999 - 1000));
        hHostcode.value = `${hostcode}`;
    }
    else if (storedHostcode != null) {
        hHostcode.value = storedHostcode;
    }
    // Load join code if stored.
    let storedJoincode = localStorage.getItem("awocards.Joincode");
    if (storedJoincode != null && hJoincode.value == "") {
        hJoincode.value = storedJoincode;
    }
    // Load name if stored.
    let storedName = localStorage.getItem("awocards.Username");
    if (storedName != null && hJoinname.value == "" && hName.value == "") {
        hJoinname.value = storedName;
        hName.value = storedName;
    }
    hJoinButton.textContent = hJoinname.value == "" ? "Spectate" : "Join";
    hJoinButton.disabled = hJoincode.value == "";
    // Load categories if stored.
    let storedCategories = localStorage.getItem("awocards.Categories");
    if (storedCategories != null) {
        for (let cat in g.categories) {
            let elem = document.getElementById("hq" + cat[0]);
            if (elem != null)
                elem.checked = false;
        }
        for (let cat of storedCategories) {
            let elem = document.getElementById("hq" + cat);
            if (elem != null)
                elem.checked = true;
        }
    }
    // Load theme if stored.
    let storedTheme = localStorage.getItem("awocards.Theme");
    if (storedTheme == "light") {
        hThemeLight.checked = true;
    }
    else if (storedTheme == "dark") {
        hThemeDark.checked = true;
    }
    else {
        hThemeSystem.checked = true;
    }
    setTheme();
    handleParse();
    handleHash();
}
let style = `
  :root{color-scheme:light dark}

  :root {
    --bg-neutral:   #ddd;
    --bg-notice:    #ffc;
    --bg-negative:  #fcc;
    --bg-positive:  #cfc;
    --bg-reference: #ccf;
    --bg-special:   #fcf;
    --bg-inverted:  #000;

    --fg-neutral:   #bbb;
    --fg-notice:    #880;
    --fg-negative:  #800;
    --fg-positive:  #080;
    --fg-reference: #00c;
    --fg-special:   #808;
    --fg-inverted:  #fff;
  }

  [data-theme=dark] {
    --bg-neutral:   #444;
    --bg-notice:    #660;
    --bg-negative:  #644;
    --bg-positive:  #464;
    --bg-reference: #448;
    --bg-special:   #646;
    --bg-inverted:  #fff;

    --fg-neutral:   #666;
    --fg-notice:    #ffc;
    --fg-negative:  #c88;
    --fg-positive:  #8c8;
    --fg-reference: #88c;
    --fg-special:   #c8c;
    --fg-inverted:  #000;
  }

  .cbgNeutral   { background-color: var(--bg-neutral); }
  .cbgNotice    { background-color: var(--bg-notice); }
  .cbgNegative  { background-color: var(--bg-negative); }
  .cbgPositive  { background-color: var(--bg-positive); }
  .cbgReference { background-color: var(--bg-reference); }
  .cbgSpecial   { background-color: var(--bg-special); }
  .cbgInverted  { background-color: var(--bg-inverted); }

  .cfgNeutral   { color: var(--fg-neutral); }
  .cfgNotice    { color: var(--fg-notice); }
  .cfgNegative  { color: var(--fg-negative); }
  .cfgPositive  { color: var(--fg-positive); }
  .cfgReference { color: var(--fg-reference); }
  .cfgSpecial   { color: var(--fg-special); }
  .cfgInverted  { color: var(--fg-inverted); }

  body { font-family: sans-serif; cursor: default; }
  #hIntro, #hWeeklyUI { max-width: 50em; margin: 0 auto; padding: 0 8px; }
  #hGameUI { margin: 0 auto; padding: 0 8px; }
  button { padding-left: 1ch; padding-right: 1ch; font-size: inherit; }
  .cNavButton { width: 45% }
  .cInitialSize { font-size: initial; }
  .cMonospace { font-family: monospace; }
  #hStatusbox { text-align: center; }
  #hGameUI { margin: 0 0; user-select: none; }
  textarea { width: 100%; }
  ol, ul { margin-left: 2ch; }
  li+li { margin-top: 1.5ex; }
  .hPrintableCard { border: 1px solid black; display: inline-block; width: 51mm; height: 37mm; padding: 1em; overflow: hidden; line-height: normal; }
  .hIdlink { text-decoration: none; opacity: 0; }
  h2 a { opacity: 0; text-decoration: none; color: var(--fg-neutral); }
  h2:hover a { opacity: 1; }
  h2:active a { opacity: 1; }
  h2:target { background-color: var(--bg-neutral); }
`;
main();
