#!/usr/bin/env python3
"""
SafePlace v1.8.0 - Python Event Importer
Estratto da JavaScript game_data.js e import in GDScript files
Protetto con backup automatico
"""

import os
import re
import json
import shutil
from datetime import datetime
import traceback

class SafePlaceEventImporter:
    def __init__(self):
        self.source_file = "archives/safeplace_advanced/js/game_data.js"
        self.backup_dir = f"backups_python_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.target_files = {
            'PLAINS': 'godot_project/scripts/events/EventsPlains.gd',
            'FOREST': 'godot_project/scripts/events/EventsForest.gd', 
            'RIVER': 'godot_project/scripts/events/EventsRiver.gd',
            'CITY': 'godot_project/scripts/events/EventsCity.gd',
            'VILLAGE': 'godot_project/scripts/events/EventsVillage.gd'
        }
        self.stats = {
            'events_extracted': 0,
            'events_imported': 0,
            'events_skipped': 0,
            'files_processed': 0
        }
        
    def create_backup(self):
        """Crea backup di sicurezza"""
        print("💾 Creating Python backup...")
        os.makedirs(self.backup_dir, exist_ok=True)
        
        # Backup file eventi
        for territory, filepath in self.target_files.items():
            if os.path.exists(filepath):
                backup_path = os.path.join(self.backup_dir, os.path.basename(filepath))
                shutil.copy2(filepath, backup_path)
                print(f"✅ Backed up: {filepath}")
        
        print(f"✅ Backup completed: {self.backup_dir}")
        
    def extract_events_from_js(self):
        """Estrae eventi dal file JavaScript"""
        print("🔍 Extracting events from game_data.js...")
        
        with open(self.source_file, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Trova sezione EVENT_DATA
        event_data_start = content.find("const EVENT_DATA = {")
        if event_data_start == -1:
            raise Exception("EVENT_DATA not found in game_data.js")
        
        # Estrai la sezione EVENT_DATA (trova il blocco completo)
        event_section = self._extract_event_data_section(content, event_data_start)
        
        # Parse eventi per territorio
        events_by_territory = self._parse_events_by_territory(event_section)
        
        total_events = sum(len(events) for events in events_by_territory.values())
        print(f"✅ Extracted {total_events} events from {len(events_by_territory)} territories")
        self.stats['events_extracted'] = total_events
        
        return events_by_territory
    
    def _extract_event_data_section(self, content, start_pos):
        """Estrae la sezione EVENT_DATA completa"""
        # Trova l'inizio del blocco
        brace_start = content.find("{", start_pos)
        if brace_start == -1:
            raise Exception("Could not find EVENT_DATA opening brace")
        
        # Conta le parentesi per trovare la fine
        brace_count = 0
        pos = brace_start
        
        while pos < len(content):
            char = content[pos]
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    # Trovata la fine del blocco
                    return content[brace_start:pos+1]
            pos += 1
        
        raise Exception("Could not find EVENT_DATA closing brace")
    
    def _parse_events_by_territory(self, event_section):
        """Parse eventi per territorio usando regex"""
        events_by_territory = {}
        
        # Pattern per identificare territori
        territory_pattern = r'(\w+):\s*\['
        territory_matches = re.finditer(territory_pattern, event_section)
        
        for match in territory_matches:
            territory = match.group(1)
            if territory in self.target_files:
                print(f"📊 Processing territory: {territory}")
                
                # Trova l'array di eventi per questo territorio
                territory_events = self._extract_territory_events(event_section, match.start())
                events_by_territory[territory] = territory_events
                
                print(f"  ✅ Found {len(territory_events)} events for {territory}")
        
        return events_by_territory
    
    def _extract_territory_events(self, content, territory_start):
        """Estrae eventi per un territorio specifico"""
        # Trova l'inizio dell'array
        array_start = content.find('[', territory_start)
        if array_start == -1:
            return []
        
        # Conta le parentesi quadre per trovare la fine dell'array
        bracket_count = 0
        pos = array_start
        
        while pos < len(content):
            char = content[pos]
            if char == '[':
                bracket_count += 1
            elif char == ']':
                bracket_count -= 1
                if bracket_count == 0:
                    # Trovata la fine dell'array
                    array_content = content[array_start+1:pos]
                    return self._parse_events_from_array(array_content)
            pos += 1
        
        return []
    
    def _parse_events_from_array(self, array_content):
        """Parse eventi dall'array JavaScript"""
        events = []
        
        # Pattern per singolo evento
        event_pattern = r'\{\s*id:\s*["\']([^"\']+)["\'][^}]*\}'
        
        # Split per eventi (approssimativo)
        event_blocks = re.split(r'\},\s*\{', array_content)
        
        for i, block in enumerate(event_blocks):
            # Pulisci il blocco
            if not block.strip().startswith('{'):
                block = '{' + block
            if not block.strip().endswith('}'):
                block = block + '}'
            
            # Estrai dati evento
            event_data = self._extract_event_data(block)
            if event_data:
                events.append(event_data)
        
        return events
    
    def _extract_event_data(self, event_block):
        """Estrae dati da un singolo evento"""
        try:
            # Estrai id
            id_match = re.search(r'id:\s*["\']([^"\']+)["\']', event_block)
            if not id_match:
                return None
            
            event_id = id_match.group(1)
            
            # Estrai title
            title_match = re.search(r'title:\s*["\']([^"\']+)["\']', event_block)
            title = title_match.group(1) if title_match else "Evento Sconosciuto"
            
            # Estrai description
            desc_match = re.search(r'description:\s*["\']([^"\']*)["\']', event_block)
            description = desc_match.group(1) if desc_match else "Descrizione non disponibile"
            
            # Quality score semplice
            quality_score = self._calculate_quality(event_id, title, description)
            
            return {
                'id': event_id,
                'title': title, 
                'description': description,
                'quality_score': quality_score,
                'raw_block': event_block
            }
            
        except Exception as e:
            print(f"⚠️ Error parsing event: {e}")
            return None
    
    def _calculate_quality(self, event_id, title, description):
        """Calcola quality score (0-100)"""
        score = 0
        
        # ID valido
        if event_id and len(event_id) > 3:
            score += 25
        
        # Title valido
        if title and len(title) > 5:
            score += 25
        
        # Description valida
        if description and len(description) > 20:
            score += 50
        
        return score
    
    def import_events_to_gdscript(self, events_by_territory):
        """Importa eventi nei file GDScript"""
        print("📝 Importing events to GDScript files...")
        
        for territory, events in events_by_territory.items():
            if territory not in self.target_files:
                continue
                
            target_file = self.target_files[territory]
            if not os.path.exists(target_file):
                print(f"⚠️ Target file not found: {target_file}")
                continue
            
            # Filtra eventi di qualità
            good_events = [e for e in events if e['quality_score'] >= 70]
            
            print(f"📊 {territory}: {len(good_events)}/{len(events)} events (quality filter)")
            
            if good_events:
                success = self._add_events_to_file(target_file, territory, good_events)
                if success:
                    self.stats['events_imported'] += len(good_events)
                    self.stats['files_processed'] += 1
                else:
                    self.stats['events_skipped'] += len(good_events)
            
    def _add_events_to_file(self, target_file, territory, events):
        """Aggiunge eventi a un file GDScript"""
        try:
            print(f"✏️ Adding {len(events)} events to {target_file}")
            
            # Leggi file esistente
            with open(target_file, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Trova il punto di inserimento (prima della chiusura finale del dictionary)
            insertion_point = content.rfind('}')
            if insertion_point == -1:
                print(f"❌ Could not find insertion point in {target_file}")
                return False
            
            # Vai indietro fino a trovare l'ultima chiusura di evento
            while insertion_point > 0 and content[insertion_point-1] in [' ', '\t', '\n']:
                insertion_point -= 1
            
            # Genera codice GDScript per i nuovi eventi
            new_events_code = self._generate_gdscript_events(events, territory)
            
            # Inserisci eventi prima della chiusura
            new_content = (
                content[:insertion_point] + 
                ",\n\t# === PYTHON IMPORT v1.8.0 ===" +
                new_events_code +
                "\n\t# === END PYTHON IMPORT ===\n" +
                content[insertion_point:]
            )
            
            # Scrivi file aggiornato
            with open(target_file, 'w', encoding='utf-8') as file:
                file.write(new_content)
            
            print(f"✅ Successfully added {len(events)} events to {target_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error updating {target_file}: {e}")
            return False
    
    def _generate_gdscript_events(self, events, territory):
        """Genera codice GDScript per gli eventi"""
        code = ""
        
        for event in events:
            event_key = f"{territory.lower()}_{event['id']}"
            
            code += f'\n\t\n\t"{event_key}": {{\n'
            code += f'\t\t"id": "{event["id"]}",\n'
            code += f'\t\t"name": "{self._escape_string(event["title"])}",\n'
            code += f'\t\t"type": 0,\n'
            code += f'\t\t"description": "{self._escape_string(event["description"])}",\n'
            code += f'\t\t"image": "",\n'
            code += f'\t\t"conditions": {{}},\n'
            code += f'\t\t"choices": []\n'  # Scelte semplificate per ora
            code += f'\t\t# Quality: {event["quality_score"]}% | Source: Python Import v1.8.0\n'
            code += f'\t}}'
        
        return code
    
    def _escape_string(self, text):
        """Escape string per GDScript"""
        return text.replace('"', '\\"').replace('\n', '\\n').replace('\t', ' ')
    
    def run_import(self):
        """Esegue l'import completo"""
        print("🚀 === SafePlace v1.8.0 Python Import Started ===")
        
        try:
            # Controlla file sorgente
            if not os.path.exists(self.source_file):
                raise Exception(f"Source file not found: {self.source_file}")
            
            # Backup
            self.create_backup()
            
            # Estrazione
            events_by_territory = self.extract_events_from_js()
            
            # Import
            self.import_events_to_gdscript(events_by_territory)
            
            # Report finale
            self._print_final_report()
            
            return True
            
        except Exception as e:
            print(f"❌ Import failed: {e}")
            print(traceback.format_exc())
            return False
    
    def _print_final_report(self):
        """Report finale"""
        print("\n🎉 === PYTHON IMPORT COMPLETED ===")
        print(f"📊 Events extracted: {self.stats['events_extracted']}")
        print(f"✅ Events imported: {self.stats['events_imported']}")
        print(f"⚠️ Events skipped: {self.stats['events_skipped']}")
        print(f"📁 Files processed: {self.stats['files_processed']}")
        print(f"💾 Backup created: {self.backup_dir}")
        print("🎯 SafePlace v1.8.0 database expanded!")
        print("📝 Remember to reload Godot project to see changes")

if __name__ == "__main__":
    importer = SafePlaceEventImporter()
    success = importer.run_import()
    
    if success:
        print("\n✅ SUCCESS: Events imported successfully!")
        exit(0)
    else:
        print("\n❌ FAILURE: Import failed!")
        exit(1) 