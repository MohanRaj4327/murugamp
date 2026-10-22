import csv
import json

def main():
    inventory = []
    with open('data/playlist-inventory.csv', mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            inventory.append({
                'video_id': r.get('video_id', '').strip(),
                'video_title': r.get('video_title', '').strip(),
                'video_url': r.get('video_url', '').strip(),
                'playlist_id': r.get('playlist_id', '').strip(),
                'playlist_title': r.get('playlist_title', '').strip(),
                'class_level': r.get('class_level', '').strip(),
                'syllabus': r.get('syllabus', '').strip(),
                'subject': r.get('subject', '').strip() or 'Physics',
                'chapter': r.get('chapter', '').strip(),
                'topic': r.get('topic', '').strip(),
                'exam_goal': r.get('exam_goal', '').strip(),
                'content_format': r.get('content_format', '').strip(),
                'language': r.get('language', '').strip() or 'Tamil',
                'duration_if_visible': r.get('duration_if_visible', '').strip()
            })

    print(f"Loaded {len(inventory)} inventory items from CSV")

    with open('data/playlist-inventory.json', mode='r', encoding='utf-8') as f:
        existing_data = json.load(f)

    playlists = existing_data.get('playlists', [])
    print(f"Loaded {len(playlists)} playlists")

    consolidated = {
        'total_videos': len(inventory),
        'total_playlists': len(playlists),
        'channel_name': 'Open Your Mind With Muruga MP',
        'channel_id': 'UCVJc7bS5lP8OrZGd7vs_yHw',
        'channel_url': 'https://www.youtube.com/channel/UCVJc7bS5lP8OrZGd7vs_yHw',
        'inventory': inventory,
        'playlists': playlists
    }

    with open('data/playlist-inventory.json', mode='w', encoding='utf-8') as f:
        json.dump(consolidated, f, indent=2, ensure_ascii=False)

    with open('data.js', mode='w', encoding='utf-8') as f:
        f.write('window.MURUGA_DATA = ' + json.dumps(consolidated, ensure_ascii=False) + ';\n')

    print("Successfully built consolidated data.js and data/playlist-inventory.json!")

if __name__ == '__main__':
    main()
