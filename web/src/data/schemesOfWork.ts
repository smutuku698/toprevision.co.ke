// Runtime mirror of curriculum-reference/<grade>/<subject>.json, extended with the fields a real Kenyan CBC
// scheme of work needs (lessonsPerWeek, assessmentMethods, per-sub-strand learningResources). Mirrored here
// rather than imported directly because curriculum-reference/ lives outside web/'s project root and is
// otherwise treated as a dev-time-only reference, not a runtime dependency — see curriculum-reference/README.md.
//
// Only Grade 6 Mathematics is populated so far (the scheme-of-work generator's pilot subject). Adding another
// subject/grade means mining its design PDF for the same three additions (see
// curriculum-reference/README.md's "lessonsPerWeek / assessmentMethods" section) and adding an entry here.

export interface SchemeSubStrand {
  name: string;
  lessonCount: number;
  specificLearningOutcomes: string[];
  keyInquiryQuestions: string[];
  learningExperiences: string[];
  learningResources: string[];
}

export interface SchemeStrand {
  name: string;
  subStrands: SchemeSubStrand[];
}

export interface SchemeSubject {
  subjectId: string;
  subject: string;
  grade: number;
  lessonsPerWeek: number;
  assessmentMethods: string[];
  strands: SchemeStrand[];
}

const grade6Math: SchemeSubject = {
  subjectId: "math",
  subject: "Mathematics",
  grade: 6,
  lessonsPerWeek: 5,
  assessmentMethods: [
    "Written tests and quizzes",
    "Rating scales",
    "Projects",
    "Observation schedules",
    "Portfolios",
    "Assessment rubric",
    "Questionnaires",
  ],
  strands: [
    {
      name: "1.0 Numbers",
      subStrands: [
        {
          name: "1.1 Whole Numbers",
          lessonCount: 20,
          specificLearningOutcomes: [
            "Use place value and total value of digits up to millions in real life",
            "Use numbers up to millions in symbols in real life",
            "Read and write numbers up to 100,000 in words in real life",
            "Order numbers up to 100,000 in real-life situations",
            "Round off numbers up to 100,000 to the nearest thousand in different situations",
            "Apply squares of whole numbers up to 100 in different situations",
            "Apply square roots of perfect squares up to 10,000 in different situations",
            "Appreciate use of whole numbers in real-life situations",
          ],
          keyInquiryQuestions: ["How do we read and write numbers in symbols and in words?"],
          learningExperiences: [
            "Work with peers to identify place value of digits up to millions using place value apparatus",
            "Work in teams to read numbers up to millions in symbols from number charts/cards",
            "Read and write numbers up to hundred thousand in words from number charts/cards",
            "Discuss and read numbers up to millions in symbols from number charts or cards",
            "Discuss with peers and form different numbers by rearranging digits of a number up to 100,000",
            "Discuss in teams and round off numbers up to hundred thousand to the nearest 1,000 from number cards and share with other groups",
            "Multiply a given number by itself and identify the answer as the square of the number",
            "Work out the square root of a given number and recognise the value which when multiplied by itself results in the given number",
            "Play games involving whole numbers using digital devices or other resources",
            "Create number charts involving number of road users to and from school or home",
          ],
          learningResources: ["Place value apparatus", "Number charts", "Number cards", "Multiplication tables"],
        },
        {
          name: "1.2 Multiplication",
          lessonCount: 6,
          specificLearningOutcomes: [
            "Multiply up to a 4-digit number by a 2-digit number in real-life situations",
            "Estimate products by rounding off numbers being multiplied to the nearest ten in real-life situations",
            "Make patterns involving multiplication of numbers not exceeding 1,000 in different situations",
            "Appreciate use of multiplication in real life",
          ],
          keyInquiryQuestions: ["How do we multiply numbers?"],
          learningExperiences: [
            "Multiply up to a 4-digit number by a 2-digit number using fact families, skip counting, multiplication chart, expanded form, digital devices",
            "Estimate products using rounding off factors and compatibility of numbers",
            "Make patterns involving multiplication with products not exceeding 1,000 using number cards",
            "Work with peers and play games involving multiplication using digital devices or other resources such as number cards",
          ],
          learningResources: ["Multiplication tables"],
        },
        {
          name: "1.3 Division",
          lessonCount: 6,
          specificLearningOutcomes: [
            "Divide up to a 4-digit number by up to a 3-digit number where the dividend is greater than the divisor, in real-life situations",
            "Estimate quotients by rounding off the dividend and divisor to the nearest ten in real-life situations",
            "Perform combined operations involving addition, subtraction, multiplication and division up to 3-digit numbers",
            "Appreciate use of division of whole numbers in real life",
          ],
          keyInquiryQuestions: ["Where is division used in real life?"],
          learningExperiences: [
            "Divide up to a 4-digit number by up to a 3-digit number and share the answers using the relationship between multiplication and division, and the long method",
            "Work out quotients by rounding off the dividend and divisor to the nearest ten",
            "Work out questions involving two, three or four operations up to 3-digit numbers",
            "Divide whole numbers using digital devices or other resources",
          ],
          learningResources: ["Multiplication tables"],
        },
        {
          name: "1.4 Fractions",
          lessonCount: 12,
          specificLearningOutcomes: [
            "Add fractions using LCM in different situations",
            "Subtract fractions using LCM in different situations",
            "Add mixed numbers in different situations",
            "Subtract mixed numbers in different situations",
            "Identify reciprocal of proper fractions up to a 2-digit number in different situations",
            "Work out squares of fractions with a numerator of one digit and denominator of a 2-digit number in different situations",
            "Express a fraction as a percentage in different situations",
            "Convert percentage to fractions in different situations",
            "Appreciate use of fractions in real life",
          ],
          keyInquiryQuestions: ["How do we add or subtract fractions?", "Where is percentage used in day-to-day life?"],
          learningExperiences: [
            "Identify LCM of numbers given from number cards",
            "Add and subtract fractions using LCM by listing multiples",
            "Add and subtract mixed fractions by converting the fractions to improper fractions",
            "Add and subtract mixed fractions by adding and subtracting whole number and fraction parts separately",
            "List the inverse of numbers between 1 and 10",
            "Calculate the reciprocal of a number by dividing 1 by the number, starting with whole numbers before proper fractions",
            "Discuss the various reciprocals of a proper fraction",
            "Calculate squares of fractions through multiplication or practically",
            "Change fractions to equivalent fractions with denominator 100 through multiplication",
            "Identify a percentage as a fraction with denominator 100",
            "Work with peers on how to change fractions to percentages and vice versa",
            "Play digital games involving fractions",
          ],
          learningResources: ["Equivalent fraction board", "Circular and rectangular cut-outs", "Counters"],
        },
        {
          name: "1.5 Decimals",
          lessonCount: 12,
          specificLearningOutcomes: [
            "Identify decimals up to ten thousandths in different situations",
            "Round off decimals up to 3 decimal places in different situations",
            "Convert decimals to fractions and fractions to decimals in different situations",
            "Convert decimals to percentages and percentages to decimals in different situations",
            "Add decimals up to 4 decimal places in different situations",
            "Subtract decimals up to 4 decimal places in different situations",
            "Appreciate use of decimals in real-life situations",
          ],
          keyInquiryQuestions: ["Where are decimals applicable in real life?"],
          learningExperiences: [
            "Work out place value of decimals up to ten thousandths using place value apparatus",
            "Relate place value of decimals up to ten thousandths to the number of decimal places",
            "Discuss and round off decimals up to 3 decimal places",
            "Change decimals to fractions using a square/rectangular grid",
            "Change fractions to decimals using a square/rectangular grid",
            "Add decimals up to 4 decimal places using shared place value apparatus",
            "Subtract decimals up to 4 decimal places using place value apparatus",
            "Play games involving decimals using digital devices or other resources",
          ],
          learningResources: ["Place value charts", "Number cards"],
        },
        {
          name: "1.6 Inequalities",
          lessonCount: 8,
          specificLearningOutcomes: [
            "Form simple inequalities in one unknown involving real-life situations",
            "Simplify inequalities in one unknown involving real-life situations",
            "Solve simple inequalities in one unknown involving real-life situations",
            "Appreciate use of inequalities in real-life situations",
          ],
          keyInquiryQuestions: ["How do we solve simple inequalities?"],
          learningExperiences: [
            "Discuss meaning of inequality symbols '>' and '<'",
            "Form inequalities in one unknown using different operations",
            "Simplify inequalities in one unknown using cards or charts",
            "Work out simple inequalities involving one unknown",
            "Play games involving inequalities using digital devices or other resources",
          ],
          learningResources: ["Digital inequality worksheets", "Greater-than/less-than/equal-to sorting cards"],
        },
      ],
    },
    {
      name: "2.0 Measurement",
      subStrands: [
        {
          name: "2.1 Length",
          lessonCount: 14,
          specificLearningOutcomes: [
            "Use the millimetre (mm) as a unit of measuring length in different situations",
            "Establish the relationship between the millimetre and centimetre in different situations",
            "Convert centimetres and millimetres to millimetres in different situations",
            "Add centimetres and millimetres in different situations",
            "Subtract centimetres and millimetres in different situations",
            "Multiply centimetres and millimetres by whole numbers in real-life situations",
            "Divide centimetres and millimetres by whole numbers in real-life situations",
            "Determine the circumference of a circle practically",
            "Identify the relationship between circumference and diameter in different situations",
            "Appreciate use of length in real-life situations",
          ],
          keyInquiryQuestions: ["Why do we measure distances in day-to-day life?", "What do we use to measure length in real life?"],
          learningExperiences: [
            "Discuss and identify the millimetre as a unit of measuring length using a ruler",
            "Measure length of objects in millimetres using a ruler",
            "Measure a given length in cm and mm to establish the relationship between mm and cm",
            "Convert mm to cm and cm to mm when measuring lengths of different objects and comparing results",
            "Measure lengths of different objects in the environment",
            "Determine lengths in mm and cm in addition, subtraction, multiplication and division and discuss the answers",
            "Sketch the circumference, diameter and radius of a circle practically",
            "Measure the circumference of a circle practically",
            "Divide circumference by diameter to get pi (π)",
            "Play games involving length in centimetres and millimetres using digital devices or other resources",
          ],
          learningResources: ["Metre rule", "1-metre ticks", "Tape measure"],
        },
        {
          name: "2.2 Area",
          lessonCount: 6,
          specificLearningOutcomes: [
            "Work out area of triangles in square centimetres (cm²)",
            "Work out area of combined shapes involving squares, rectangles and triangles in cm²",
            "Estimate the area of circles by counting squares",
            "Appreciate the use of cm² in working out area in real life",
          ],
          keyInquiryQuestions: ["Where is area used in real life?"],
          learningExperiences: [
            "Establish that the area of a triangle is equal to a half of the area of a rectangle or a square when it is divided by a diagonal",
            "Work out the area of triangles in cm² using the relationship between a rectangle and a triangle (Area = ½ × L × W)",
            "Sketch a circle on a unit square grid and count the full squares to estimate the area of circles and compare answers",
            "Prepare own combined shapes involving rectangles, squares, triangles and ask peers to determine the area",
            "Play games involving area using digital tools or other resources",
          ],
          learningResources: ["Square cut-outs", "1cm squares", "1m squares"],
        },
        {
          name: "2.3 Capacity",
          lessonCount: 6,
          specificLearningOutcomes: [
            "Identify the relationship among cubic centimetres (cm³), millilitres and litres in real life",
            "Convert litres to millilitres in different situations",
            "Convert capacity in millilitres to litres in different situations",
            "Appreciate use of cm³ and litres in measuring capacity in real life",
          ],
          keyInquiryQuestions: ["How can we measure capacity?", "Where is capacity applicable in real life?"],
          learningExperiences: [
            "Work out the relationship between cm³, millilitres and litres through measuring practically",
            "Measure capacity in millilitres and litres, discuss answers and share with others",
            "Change capacity in litres to millilitres using containers from the environment by comparing sizes of different containers",
            "Work out conversions of capacity of millilitres to litres",
            "Play games involving capacity using containers of different capacities",
          ],
          learningResources: ["Teaspoons", "Containers of different sizes", "Water", "Sand", "Soil"],
        },
        {
          name: "2.4 Mass",
          lessonCount: 14,
          specificLearningOutcomes: [
            "Identify the tonne as a unit for measuring mass in real life",
            "Identify items measured in tonnes in real life",
            "Identify the relationship between the kilogramme and the tonne",
            "Estimate mass in tonnes in different situations",
            "Convert kilogrammes to tonnes and tonnes to kilogrammes in real-life situations",
            "Add tonnes and kilogrammes in real-life situations",
            "Subtract tonnes and kilogrammes in real-life situations",
            "Multiply tonnes and kilogrammes by whole numbers in real-life situations",
            "Divide tonnes and kilogrammes by whole numbers in real-life situations",
            "Appreciate use of the kilogramme and tonne in measuring mass",
          ],
          keyInquiryQuestions: [
            "How can we measure large amounts of mass?",
            "In what situations would the tonne be more applicable to use when measuring mass?",
          ],
          learningExperiences: [
            "Discuss tonne as a unit of measuring mass",
            "Discuss items in the environment such as loaded lorries, whose mass may be measured in tonnes",
            "Establish the relationship between the kilogramme and the tonne (1000 kg = 1 tonne)",
            "Estimate mass in tonnes of various objects found in the environment",
            "Change kilogrammes to tonnes and tonnes to kilogrammes",
            "Determine mass of items in tonnes and kilogrammes using addition, subtraction, multiplication and division",
            "Use digital weighing machines to measure mass of different items",
          ],
          learningResources: ["Teaspoons", "Soil or sand", "Manual/electronic weighing machine", "Beam balance"],
        },
        {
          name: "2.5 Time",
          lessonCount: 10,
          specificLearningOutcomes: [
            "Identify time in a.m. and p.m. in day-to-day life experiences",
            "Write time in a.m. and p.m. in day-to-day life",
            "Relate time in a.m. and p.m. to the 24h clock system",
            "Convert time from 12h to 24h and 24h to 12h system",
            "Interpret travel timetable in different situations",
            "Appreciate use of time in both 12h and 24h systems",
          ],
          keyInquiryQuestions: ["How do we read and tell time?"],
          learningExperiences: [
            "Discuss time in a.m. and p.m. from digital and analogue clocks",
            "Determine time in a.m. and p.m. from digital and analogue clocks",
            "Equate time in a.m. and p.m. to the 24h clock system using a chart",
            "Change time from the 12h to 24h system and 24h to 12h using a chart",
            "Interpret travel timetables to create travel schedules for different events",
            "Determine time durations of travelling using travel timetables within the country",
            "Check local time using digital or analogue clock in 12h and 24h systems",
          ],
          learningResources: ["Analogue and digital clocks", "Digital watches", "Stopwatches"],
        },
        {
          name: "2.6 Money",
          lessonCount: 8,
          specificLearningOutcomes: [
            "Prepare simple budget in different situations",
            "Determine buying and selling prices of different items in the community",
            "Work out profit from sales of different items in the community",
            "Calculate loss realised from sales of different items in the community",
            "Identify types of taxes in different situations",
            "Appreciate use of money in real-life situations",
          ],
          keyInquiryQuestions: ["How can you make profit in a business?"],
          learningExperiences: [
            "Identify different shopping items in the community or at home, especially food items, and prepare a simple budget",
            "Discuss the meaning of buying and selling price",
            "Determine buying and selling prices of different items in the community",
            "Discuss the meaning of profit and loss in real-life situations and share with peers",
            "Discuss and determine profit and loss by practising buying and selling from the classroom model shop",
            "Discuss income and value added tax (VAT) from receipts issued by shops and retailers as a form of tax",
            "Use IT devices or other resources to explore more on money",
          ],
          learningResources: ["Price list", "Classroom shop", "Electronic money tariff charts"],
        },
      ],
    },
    {
      name: "3.0 Geometry",
      subStrands: [
        {
          name: "3.1 Lines",
          lessonCount: 6,
          specificLearningOutcomes: [
            "Draw parallel lines in different situations",
            "Bisect lines by construction",
            "Construct perpendicular lines in different situations",
            "Appreciate use of lines in daily life",
          ],
          keyInquiryQuestions: ["Why do we need to draw lines?"],
          learningExperiences: [
            "Construct parallel lines using geometrical instruments and other writing materials",
            "Bisect lines using geometrical instruments",
            "Draw perpendicular lines using geometrical instruments",
            "Share digital devices and other resources to draw parallel lines",
          ],
          learningResources: ["Chalkboard ruler", "30cm ruler", "Straight edges"],
        },
        {
          name: "3.2 Angles",
          lessonCount: 6,
          specificLearningOutcomes: [
            "Identify angles on a straight line at a point in different situations",
            "Measure angles on a straight line at a point in different situations",
            "Work out sum of angles on a straight line in different situations",
            "Determine the sum of angles in rectangles and triangles",
            "Construct equilateral, right-angled and isosceles triangles",
            "Measure the interior angles of equilateral, right-angled and isosceles triangles",
            "Appreciate use of angles in real life",
          ],
          keyInquiryQuestions: ["Where can you use angles in real life?"],
          learningExperiences: [
            "Discuss angles on a straight line using concrete objects that have straight edges",
            "Draw a line that cuts the straight line to form an angle; measure and write the size(s) of angles formed; compare with classmates",
            "Work out the sizes of various angles on a straight line",
            "Practically establish the sum of angles in a triangle and rectangles using different objects in the environment",
            "Identify and draw equilateral, right-angled and isosceles triangles using geometrical instruments",
            "Practically establish the sum of the interior angles in a rectangle and triangle",
            "Use geometrical instruments or digital resources to practise drawing different lines and angles",
          ],
          learningResources: ["Unit angles", "Protractors", "Rulers"],
        },
        {
          name: "3.3 3-D Objects",
          lessonCount: 6,
          specificLearningOutcomes: [
            "Identify vertices, faces and edges in cuboids and cubes in different situations",
            "Identify faces and edges of cylinders in different situations",
            "Describe plane figures in 3-D objects in the environment",
            "Appreciate use of 3-D objects in real life",
          ],
          keyInquiryQuestions: ["How do we use containers in daily life?"],
          learningExperiences: [
            "Discuss and collect 3-D objects and safely keep them as part of their role in environmental conservation",
            "Identify and relate cuboids and cylinders in the environment",
            "Open up nets of cuboids, cubes and cylinders and sketch the layout",
            "Discuss the rectangular, square and circular shapes on the nets",
            "Manipulate 3-D objects using containers or digitally using IT devices",
          ],
          learningResources: ["Cubes", "Cuboids", "Cylinders", "Pyramids", "Spheres", "Cut-outs of rectangles, circles and triangles of different sizes"],
        },
      ],
    },
    {
      name: "4.0 Data Handling",
      subStrands: [
        {
          name: "4.1 Bar Graphs",
          lessonCount: 10,
          specificLearningOutcomes: [
            "Draw a frequency table of real-life situation data",
            "Represent data from real-life situations using pictographs",
            "Represent data from real-life situations through piling",
            "Represent data from real-life situations using bar graphs",
            "Interpret information from bar graphs",
            "Appreciate use of bar graphs in real life",
          ],
          keyInquiryQuestions: ["How can bar graphs be used in real-life situations?"],
          learningExperiences: [
            "Discuss with peers and collect data on identified topic from immediate environment and organise the data in a frequency table",
            "Collect data, discuss and organise it in pictographs",
            "Pile similar objects such as match boxes vertically to represent data",
            "Discuss and organise data in form of bar graphs",
            "Discuss information represented on bar graphs and explain what it represents",
            "Use digital devices or other resources to draw bar graphs and other charts to present data",
          ],
          learningResources: ["Bar graph worksheets", "Data graph worksheets", "Data samples from different sources"],
        },
      ],
    },
  ],
};

export const SCHEMES_OF_WORK: SchemeSubject[] = [grade6Math];

export function findScheme(subjectId: string, grade: number): SchemeSubject | undefined {
  return SCHEMES_OF_WORK.find((s) => s.subjectId === subjectId && s.grade === grade);
}
