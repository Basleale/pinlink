extends CharacterBody2D

# Expose variables to the Inspector so you can tweak them without touching code
@export var speed: float = 400.0
@export var steering_speed: float = 4.0
@export var traction: float = 1.5 # Lower = more slide, Higher = tight grip

func _physics_process(delta: float) -> void:
	# 1. Handle Steering Input
	# get_axis returns -1 if left is pressed, 1 if right is pressed, 0 if neither
	var turn_input = Input.get_axis("steer_left", "steer_right")
	
	# Rotate the car
	rotation += turn_input * steering_speed * delta

	# 2. Calculate Forward Direction
	# Vector2.RIGHT is Godot's default forward (X-axis). We rotate it to match the car.
	var forward_direction = Vector2.RIGHT.rotated(rotation)

	# 3. Calculate Target Velocity (Auto-Acceleration)
	var target_velocity = forward_direction * speed

	# 4. The Drift Magic (Interpolation)
	# Smoothly pull the current velocity toward the target velocity based on traction
	velocity = velocity.lerp(target_velocity, traction * delta)

	# 5. Apply Movement
	# This built-in function actually moves the CharacterBody2D using the 'velocity' variable
	move_and_slide()
