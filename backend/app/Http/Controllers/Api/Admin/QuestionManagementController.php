<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreQuestionRequest;
use App\Models\PackageSection;
use App\Models\Question;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class QuestionManagementController extends Controller
{
    public function index(PackageSection $section)
    {
        return $this->success($section->questions()->with('options')->get());
    }

    public function store(StoreQuestionRequest $request)
    {
        $data = $request->validated();

        $question = DB::transaction(function () use ($data) {
            $question = Question::create([
                'section_id' => $data['section_id'],
                'question_text' => $data['question_text'],
                'explanation' => $data['explanation'] ?? null,
                'difficulty' => $data['difficulty'] ?? 'medium',
                'score' => $data['score'] ?? 1,
                'order' => $data['order'] ?? 0,
            ]);

            foreach ($data['options'] as $i => $opt) {
                $question->options()->create([
                    'option' => $opt['option'],
                    'option_text' => $opt['option_text'],
                    'is_correct' => $opt['is_correct'] ?? false,
                    'order' => $i,
                ]);
            }

            return $question;
        });

        return $this->success($question->load('options'), 'Question created.', 201);
    }

    public function update(Question $question)
    {
        $data = request()->validate([
            'question_text' => ['sometimes', 'string'],
            'explanation' => ['nullable', 'string'],
            'difficulty' => ['in:easy,medium,hard'],
            'score' => ['integer', 'min:1'],
            'order' => ['integer', 'min:0'],
        ]);

        $question->update($data);

        return $this->success($question->load('options'), 'Question updated.');
    }

    public function uploadImage(Question $question)
    {
        request()->validate(['image' => ['required', 'image', 'max:4096']]);
        $path = request()->file('image')->store('questions/images', 'public');
        $question->update(['image' => $path]);

        return $this->success(['image' => $path], 'Image uploaded.');
    }

    public function uploadAudio(Question $question)
    {
        request()->validate(['audio' => ['required', 'mimes:mp3,wav,ogg', 'max:8192']]);
        $path = request()->file('audio')->store('questions/audio', 'public');
        $question->update(['audio' => $path]);

        return $this->success(['audio' => $path], 'Audio uploaded.');
    }

    public function destroy(Question $question)
    {
        $question->delete();

        return $this->success([], 'Question deleted.');
    }
}
