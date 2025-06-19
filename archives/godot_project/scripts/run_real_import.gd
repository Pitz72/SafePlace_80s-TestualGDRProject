extends Node

# 🚀 REAL IMPORT EXECUTION - SafePlace v1.8.0
# Uses cleaned ContentImporter system with safe mode DISABLED

func _ready():
	print("🚀 === SAFESPACE v1.8.0 REAL IMPORT ===")
	print("📈 Target: Import reale di 70+ eventi dal game_data.js")
	print("⚠️ Safe mode DISABILITATO - Import reale in corso...")
	start_real_import()

func start_real_import():
	# Create ContentImporter
	var importer = ContentImporter.new()
	add_child(importer)
	
	# Connect signals
	importer.import_completed.connect(_on_import_completed)
	importer.batch_completed.connect(_on_batch_completed)
	importer.import_progress.connect(_on_import_progress)
	
	# Start real import
	var archive_path = "archives/safeplace_advanced/js/game_data.js"
	print("🎯 Starting REAL import from: " + archive_path)
	
	var success = importer.start_mass_import(archive_path)
	
	if not success:
		print("❌ Failed to start import")

func _on_import_progress(current: int, total: int, phase: String):
	print("📊 Progress: " + str(current) + "/" + str(total) + " - " + phase)

func _on_batch_completed(batch_number: int, imported: int, skipped: int):
	print("📦 Batch " + str(batch_number) + " REAL import: " + str(imported) + " imported, " + str(skipped) + " skipped")

func _on_import_completed(results: Dictionary):
	print("🎉 === REAL IMPORT COMPLETED ===")
	
	if results.success:
		var stats = results.get("stats", {})
		print("✅ IMPORT SUCCESS!")
		print("  📊 Events imported: " + str(stats.get("total_imported", 0)))
		print("  ⏭️ Events skipped: " + str(stats.get("total_skipped", 0)))
		print("  ⏱️ Duration: " + str(results.get("duration", 0)) + " seconds")
		print("  📈 Efficiency: " + str("%.1f" % (results.get("efficiency", 0) * 100)) + "%")
		print("")
		print("🎯 SafePlace v1.8.0 DATABASE EXPANDED!")
		print("🎮 Ready to play with expanded content!")
	else:
		print("❌ Import failed: " + str(results.get("error", "Unknown error")))
		print("🔧 Check logs for details")
	
	# Cleanup
	get_tree().quit() 