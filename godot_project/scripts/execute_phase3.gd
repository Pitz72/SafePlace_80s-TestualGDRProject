extends Node

# 🚀 Execute Phase 3 Mega Import - SafePlace v1.8.0
# Uses existing Phase3MegaImporter system

func _ready():
	print("🚀 === EXECUTING PHASE 3 MEGA IMPORT ===")
	print("📈 Target: 138+ → 300+ eventi (from game_data.js)")
	execute_mega_import()

func execute_mega_import():
	# Create importer
	var importer = Phase3MegaImporter.new()
	add_child(importer)
	
	# Connect signals
	importer.mega_import_started.connect(_on_import_started)
	importer.mega_import_completed.connect(_on_import_completed)
	importer.batch_progress.connect(_on_batch_progress)
	
	# Start import
	print("🎯 Launching existing Phase3MegaImporter...")
	var success = await importer.start_mega_import()
	
	if success:
		print("✅ MEGA IMPORT COMPLETED SUCCESSFULLY!")
		print("🎉 SafePlace v1.8.0 DATABASE EXPANSION COMPLETE!")
	else:
		print("❌ Mega import failed")

func _on_import_started():
	print("🚀 Mega import started!")

func _on_batch_progress(current: int, total: int, percentage: float):
	print("📦 Batch progress: " + str(current) + "/" + str(total) + " (" + str(percentage) + "%)")

func _on_import_completed(total_imported: int, total_skipped: int, duration: float):
	print("🎉 IMPORT COMPLETED!")
	print("  ✅ Events imported: " + str(total_imported))
	print("  ⚠️ Events skipped: " + str(total_skipped))
	print("  ⏱️ Duration: " + str(duration) + " seconds")
	print("")
	print("📊 DATABASE GROWTH ACHIEVED!")
	print("🎯 SafePlace v1.8.0 is ready!") 