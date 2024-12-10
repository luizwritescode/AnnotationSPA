'''
classes for the annotations
# 0 - rebarba
# 1 - rachadura
# 2 - perfuração
# 3 - não polida
# 4 - sem defeito
'''

import os
import json

dataset_folder = "public\\dataset"
manifest = { "train": [], "valid": [], "test": [], "test30": [] }

targets = ["train", "valid", "test", "test30"]

for target in targets:
	# /dataset/train/images
	image_list = os.listdir(os.path.join(dataset_folder, target, "images"))
	for image_file in image_list:
		if image_file.endswith(".jpg"):
			image_path = os.path.join(dataset_folder, target, "images", image_file)
			annotation_path = os.path.join(dataset_folder, target, "labels", image_file.replace(".jpg", ".txt"))

			try:
				annot_data = []

				with open(annotation_path, "r") as f:
					for line in f:
						class_id, center_x, center_y, width, height = line.replace('\n', '').split(" ")

						assert int(class_id) in range(0, 5)
						assert float(center_x) >= 0 and float(center_x) <= 1
						assert float(center_y) >= 0 and float(center_y) <= 1
						assert float(width) >= 0 and float(width) <= 1
						assert float(height) >= 0 and float(height) <= 1

						# if any of the assertions fail, raise an exception
						if not (int(class_id) in range(0, 5) and float(center_x) >= 0 and float(center_x) <= 1 and float(center_y) >= 0 and float(center_y) <= 1 and float(width) >= 0 and float(width) <= 1 and float(height) >= 0 and float(height) <= 1):
							raise Exception(f"Invalid annotation data in {annotation_path}")
						
						annot_data.append({
							"class_id": int(class_id),
							"center_x": float(center_x),
							"center_y": float(center_y),
							"width": float(width),
							"height": float(height)
						})

				f.close()

				if len(annot_data) == 0:
					raise Exception(f"No annotations found in {annotation_path}")

				manifest[target].append({
					"image_path": image_path,
					"annotation_data": annot_data
				})
			except Exception as e:
				print(f"Error: {e}")


with open("public\\dataset\\manifest.json", "w") as f:
	json.dump(manifest, f, indent=4)

print(f"Manifest generated successfully at 'public\\dataset\\manifest.json'")