
import os
import json
import numpy as np

# Function to read YOLOv5 format bounding boxes from a text file
def read_yolo_boxes(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()
        boxes = []
        for line in lines:
            box_data = line.strip().split()
            
            if len(box_data) == 0:
                continue
            
            class_id = int(box_data[0])
            x_center = float(box_data[1])
            y_center = float(box_data[2])
            width = float(box_data[3])
            height = float(box_data[4])

            boxes.append((class_id, x_center, y_center, width, height))

    return boxes

cwd = os.getcwd()

dataset_path = os.path.join(cwd, "public", "dataset")

subsets = ["train", "test", "valid", "test+valid", "test30", "testbonus"]

manifest = {}

for subset in subsets:
    subset_folder = os.path.join(dataset_path, subset)
    images_folder = os.path.join(subset_folder, "images")
    labels_folder = os.path.join(subset_folder, "labels")

    images = os.listdir(images_folder)
    labels = os.listdir(labels_folder)

    subset_info = []

    for label in labels:
        image_name = label.replace(".txt", ".jpg")
        image_rel_path = os.path.join("dataset", subset, "images", image_name)

        boxes = read_yolo_boxes(os.path.join(labels_folder, label))

        annotation_data = []

        for box in boxes:
            class_id, x_center, y_center, width, height = box
            annotation_data.append({
                'class_id': class_id,
                'x_center': x_center,
                'y_center': y_center,
                'width': width,
                'height': height
            })
        
        subset_info.append({
            'image_path': image_rel_path,
            'annotation_data': annotation_data
        })

    # shuffle the order of the images
    np.random.shuffle(subset_info)

    manifest[subset] = subset_info



manifest_output_path = os.path.join(os.getcwd(), "manifest.json")

# Write dataset_info to JSON file
with open(manifest_output_path, 'w', encoding="UTF-8") as json_file:
    json.dump(manifest, json_file, indent=4)