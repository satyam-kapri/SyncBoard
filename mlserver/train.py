import kagglehub
path = kagglehub.dataset_download("frobert/handdrawn-shapes-hds-dataset")
# print("Path to dataset files:", path)

classes=['ellipse','other','rectangle','triangle']
data=[]
labels=[]



import os
path=os.path.join(path,"data")
print(path)

IMG_HEIGHT, IMG_WIDTH = 70, 70

for idx,class_name in enumerate(classes):
  for folder in os.listdir(path):
    folder_name=os.path.join(path,folder,"images",class_name)
    if(os.path.exists(folder_name)):
      for filename in os.listdir(folder_name):
          file_path=os.path.join(folder_name,filename)
          try:
              data.append(file_path)
              labels.append(idx)  # Assign label based on class index
          except Exception as e:
              print(f"Error processing file {file_path}: {e}")



import numpy as np
from tensorflow.keras.preprocessing import image

# Function to preprocess the image (convert to grayscale and resize)
def preprocess_image(image_path):
    # Load the image
    img = image.load_img(image_path, target_size=(IMG_HEIGHT, IMG_WIDTH), color_mode='grayscale')
    # Convert the image to a numpy array
    img = image.img_to_array(img)
    if img.ndim == 2:
       img = np.expand_dims(img, axis=-1)
    # Normalize the image
    img = img / 255.0
    # print(img.shape)
    return img

def preprocess_dataset(data):
    new_data=[]
    for img_path in data:
      new_image=preprocess_image(img_path)
      new_data.append(new_image)
    return np.array(new_data)

data=preprocess_dataset(data)
labels = np.array(labels)



from sklearn.model_selection import train_test_split
X_train, X_temp, y_train, y_temp = train_test_split(data, labels, test_size=0.3, random_state=42)
X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

y_train.shape

import tensorflow as tf
y_train = tf.keras.utils.to_categorical(y_train, num_classes=4)
y_val = tf.keras.utils.to_categorical(y_val, num_classes=4)
y_test=tf.keras.utils.to_categorical(y_test, num_classes=4)

y_train.shape

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras import layers
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.models import Model
# # Build the CNN model
model = Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_HEIGHT, IMG_WIDTH, 1)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dense(4, activation='softmax')  # Assuming multi-class classification
])


# Compile the model
model.compile(optimizer=Adam(), loss='categorical_crossentropy', metrics=['accuracy'])

history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=10,
    batch_size=32
)



# Evaluate the model
test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=2)
print(f"Test Accuracy: {test_accuracy:.2f}")


# Save the trained model
model.save('shape_classifier2.h5')
