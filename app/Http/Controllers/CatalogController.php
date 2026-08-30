<?php

namespace App\Http\Controllers;

use App\Enums\SubjectType;
use App\Http\Requests\SearchCatalogRequest;
use App\Services\Catalog\CatalogSearchService;
use Illuminate\Http\JsonResponse;

class CatalogController extends Controller
{
    public function search(SearchCatalogRequest $request, CatalogSearchService $catalog): JsonResponse
    {
        $data = $request->validated();
        $type = isset($data['type']) ? SubjectType::from($data['type']) : null;

        return response()->json($catalog->search($data['query'], $type));
    }
}
