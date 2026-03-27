extends CharacterBody2D

# --- CAR SPECS ---
@export var constant_speed: float = 600.0
@export var wheel_base: float = 70.0 
@export var steering_angle: float = 25.0 

# --- DRIFT SPECS ---
@export var slip_speed: float = 300.0
@export var traction_fast: float = 0.03 # Back to the slippery drift you liked
@export var traction_slow: float = 0.8 

# --- HEALTH & CRASH ---
@export var max_health: float = 100.0
var current_health: float
var is_recovering: bool = false 

func _ready():
	current_health = max_health
	velocity = transform.x * constant_speed

func _physics_process(delta: float) -> void:
	if is_recovering:
		move_and_slide()
		return
		
	var turn = Input.get_axis("steer_left", "steer_right")
	var steer_direction = turn * deg_to_rad(steering_angle)
	
	# 1. THE FUN DRIFT MATH (Protected from glitching!)
	# We only use the two-wheel bicycle math if we are moving fast enough.
	if velocity.length() > 50:
		var rear_wheel = position - transform.x * (wheel_base / 2.0)
		var front_wheel = position + transform.x * (wheel_base / 2.0)
		
		rear_wheel += velocity * delta
		front_wheel += velocity.rotated(steer_direction) * delta
		
		var new_heading = (front_wheel - rear_wheel).normalized()
		rotation = new_heading.angle()
	else:
		# ANTI-LOCKOUT: If we are crashed and stuck at 0 speed, 
		# this lets us still steer the car to face away from the wall.
		rotation += turn * 3.0 * delta
	
	# 2. Auto-Acceleration
	var target_velocity = transform.x * constant_speed
	
	# 3. The Heavy Momentum (No more lateral drag killing your slide)
	var current_traction = traction_slow
	if velocity.length() > slip_speed:
		current_traction = traction_fast
		
	velocity = velocity.lerp(target_velocity, current_traction * delta * 15.0)

	# 4. Save velocity & Move
	var pre_crash_velocity = velocity 
	move_and_slide()
	handle_collisions(pre_crash_velocity)

func handle_collisions(pre_crash_velocity: Vector2):
	for i in get_slide_collision_count():
		var collision = get_slide_collision(i)
		var collider = collision.get_collider()
		
		if collider is TileMap:
			var impact_speed = pre_crash_velocity.length()
			
			if impact_speed > 100:
				take_damage(impact_speed * 0.05, collision.get_normal(), pre_crash_velocity)
			break 

func take_damage(amount: float, wall_normal: Vector2, pre_crash_velocity: Vector2):
	current_health -= amount
	print("CRASH! Took %.1f damage. Health: %.1f" % [amount, current_health])
	
	is_recovering = true
	
	# Safely bounce off the wall using the speed we had right before impact
	var bounce_dir = pre_crash_velocity.bounce(wall_normal).normalized()
	velocity = bounce_dir * (constant_speed * 0.4) 
	
	# Face the direction we are bouncing
	rotation = velocity.angle()
	
	if current_health <= 0:
		print("Car Totaled! Respawning...")
		current_health = max_health
		position = Vector2(2, 8) # Back to the start
		rotation = 0
		velocity = transform.x * constant_speed
	
	await get_tree().create_timer(0.4).timeout
	is_recovering = false
