# AnnotationSPA

Authors:

Luiz Henrique Corrêa da Costa
Helaine Pereira Neves

This is a firebase Single Page Application for annotating images. It was conceived for doctorate research paper where there was a need for a tool to collect data from participants for comparing performance of computer vision and humans in a industrial quality control scenario. It consists of a tutorial, training phase and testing phase where humans are benchmarked on their capacity to find defects in industrial parts (metal castings). The raw annotations are saved to a firestore database and need to be processed with scripts that cross-reference them with ground-truth annotations in order to extract meaningful data.


Note: Remember to change rewrites in firebase.json if implementing functions (requires Blaze "payasyougo" plan)
